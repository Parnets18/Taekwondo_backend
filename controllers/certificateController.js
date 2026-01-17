const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const Student = require('../models/Student');
const User = require('../models/User');
const CertificateService = require('../services/CertificateService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Configure multer for certificate image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join('uploads', 'certificates');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'certificate-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF) and PDF files are allowed'));
    }
  }
});

const certificateService = new CertificateService();

// Get all certificates with filtering and pagination
const getCertificates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.achievementType) {
      filter.achievementType = req.query.achievementType;
    }
    if (req.query.studentName) {
      filter.studentName = { $regex: req.query.studentName, $options: 'i' };
    }
    if (req.query.instructorName) {
      filter['achievementDetails.examiner'] = { $regex: req.query.instructorName, $options: 'i' };
    }

    const certificates = await Certificate.find(filter)
      .populate('studentId', 'fullName studentId email phone')
      .populate('templateId', 'name type')
      .populate('issuedBy', 'name email')
      .sort({ issuedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Certificate.countDocuments(filter);

    // Add image URL for certificates
    const certificatesWithImages = certificates.map(cert => {
      const certObj = cert.toObject();
      if (certObj.filePath) {
        certObj.imageUrl = `/uploads/certificates/${path.basename(certObj.filePath)}`;
      }
      return certObj;
    });

    res.json({
      status: 'success',
      data: {
        certificates: certificatesWithImages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch certificates'
    });
  }
};

// Get certificate by ID
const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('studentId', 'fullName studentId email phone')
      .populate('templateId', 'name type')
      .populate('issuedBy', 'name email');

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found'
      });
    }

    const certObj = certificate.toObject();
    if (certObj.filePath) {
      certObj.imageUrl = `/uploads/certificates/${path.basename(certObj.filePath)}`;
    }

    res.json({
      status: 'success',
      data: { certificate: certObj }
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch certificate'
    });
  }
};

// Create new certificate with image upload
const createCertificate = async (req, res) => {
  try {
    const {
      studentName,
      instructorName,
      achievementType,
      achievementTitle,
      achievementDescription,
      level,
      grade,
      examiner,
      customVerificationCode
    } = req.body;

    // Validate required fields
    if (!studentName || !instructorName || !achievementType || !achievementTitle) {
      return res.status(400).json({
        status: 'error',
        message: 'Student name, instructor name, achievement type, and title are required'
      });
    }

    // Generate or use custom verification code
    let verificationCode;
    if (customVerificationCode) {
      // Check if custom code already exists
      const existingCert = await Certificate.findOne({ 
        verificationCode: customVerificationCode.toUpperCase() 
      });
      if (existingCert) {
        return res.status(400).json({
          status: 'error',
          message: 'Verification code already exists. Please use a different code.'
        });
      }
      verificationCode = customVerificationCode.toUpperCase();
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Certificate verification code is required'
      });
    }

    // Handle file upload
    let filePath = null;
    let fileHash = null;
    let fileSize = 0;

    if (req.file) {
      filePath = req.file.path;
      const fileBuffer = await fs.readFile(filePath);
      fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      fileSize = req.file.size;
    }

    // Create certificate data
    const certificateData = {
      verificationCode,
      studentName,
      achievementType,
      achievementDetails: {
        title: achievementTitle,
        description: achievementDescription,
        level: level || '',
        grade: grade || '',
        examiner: examiner || instructorName
      },
      issuedBy: req.user._id,
      filePath,
      fileHash,
      metadata: {
        templateVersion: '1.0',
        generationMethod: 'manual',
        fileSize,
        instructorName
      }
    };

    // Create certificate
    const certificate = new Certificate(certificateData);
    await certificate.save();

    // Populate the created certificate
    const populatedCertificate = await Certificate.findById(certificate._id)
      .populate('issuedBy', 'name email');

    const certObj = populatedCertificate.toObject();
    if (certObj.filePath) {
      certObj.imageUrl = `/uploads/certificates/${path.basename(certObj.filePath)}`;
    }

    res.status(201).json({
      status: 'success',
      message: 'Certificate created successfully',
      data: { certificate: certObj }
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create certificate'
    });
  }
};

// Update certificate
const updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found'
      });
    }

    const {
      studentName,
      achievementType,
      achievementTitle,
      achievementDescription,
      level,
      grade,
      examiner,
      status
    } = req.body;

    // Update certificate fields
    if (studentName) certificate.studentName = studentName;
    if (achievementType) certificate.achievementType = achievementType;
    if (achievementTitle) certificate.achievementDetails.title = achievementTitle;
    if (achievementDescription) certificate.achievementDetails.description = achievementDescription;
    if (level) certificate.achievementDetails.level = level;
    if (grade) certificate.achievementDetails.grade = grade;
    if (examiner) certificate.achievementDetails.examiner = examiner;
    if (status) certificate.status = status;

    // Handle file upload if new file provided
    if (req.file) {
      // Delete old file if exists
      if (certificate.filePath) {
        try {
          await fs.unlink(certificate.filePath);
        } catch (err) {
          console.log('Old file not found or already deleted');
        }
      }

      certificate.filePath = req.file.path;
      const fileBuffer = await fs.readFile(req.file.path);
      certificate.fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      certificate.metadata.fileSize = req.file.size;
    }

    await certificate.save();

    const updatedCertificate = await Certificate.findById(certificate._id)
      .populate('issuedBy', 'name email');

    const certObj = updatedCertificate.toObject();
    if (certObj.filePath) {
      certObj.imageUrl = `/uploads/certificates/${path.basename(certObj.filePath)}`;
    }

    res.json({
      status: 'success',
      message: 'Certificate updated successfully',
      data: { certificate: certObj }
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update certificate'
    });
  }
};

// Delete certificate
const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found'
      });
    }

    // Delete file if exists
    if (certificate.filePath) {
      try {
        await fs.unlink(certificate.filePath);
      } catch (err) {
        console.log('File not found or already deleted');
      }
    }

    await Certificate.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete certificate'
    });
  }
};

// Verify certificate by verification code
const verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification code is required'
      });
    }

    const result = await certificateService.verifyCertificate(verificationCode);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Verification service temporarily unavailable'
    });
  }
};

// Download certificate
const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found'
      });
    }

    if (!certificate.filePath) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate file not found'
      });
    }

    // Increment download count
    await certificate.incrementDownloadCount();

    // Send file
    const fileName = `certificate_${certificate.verificationCode}${path.extname(certificate.filePath)}`;
    res.download(certificate.filePath, fileName);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download certificate'
    });
  }
};

// Get certificate statistics
const getCertificateStatistics = async (req, res) => {
  try {
    const stats = await certificateService.getCertificateStats();
    
    // Additional statistics
    const recentCertificates = await Certificate.countDocuments({
      issuedDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const instructorStats = await Certificate.aggregate([
      {
        $group: {
          _id: '$achievementDetails.examiner',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      status: 'success',
      data: {
        ...stats,
        recentCertificates,
        topInstructors: instructorStats
      }
    });
  } catch (error) {
    console.error('Error fetching certificate statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics'
    });
  }
};

// Send certificate via email
const sendCertificateEmail = async (req, res) => {
  try {
    const { certificateId, recipientEmail, message } = req.body;

    if (!certificateId || !recipientEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Certificate ID and recipient email are required'
      });
    }

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found'
      });
    }

    // Here you would integrate with your email service (nodemailer, sendgrid, etc.)
    // For now, we'll simulate the email sending
    console.log(`Sending certificate ${certificate.verificationCode} to ${recipientEmail}`);
    console.log(`Message: ${message}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      status: 'success',
      message: 'Certificate email sent successfully'
    });
  } catch (error) {
    console.error('Error sending certificate email:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send certificate email'
    });
  }
};

// Helper function to generate verification code
const generateVerificationCode = () => {
  const randomBytes = crypto.randomBytes(8);
  return randomBytes.toString('hex').toUpperCase();
};

module.exports = {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  verifyCertificate,
  downloadCertificate,
  getCertificateStatistics,
  sendCertificateEmail,
  upload
};