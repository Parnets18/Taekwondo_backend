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

// Import cloudinary config
const { cloudinary } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Use Cloudinary storage if configured, otherwise use local storage
let certificateStorage;
if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('☁️ Using Cloudinary storage for certificates');
  certificateStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'taekwondo/certificates',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
      resource_type: 'auto',
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `certificate-${uniqueSuffix}`;
      }
    }
  });
} else {
  console.log('📁 Using local storage for certificates');
  certificateStorage = storage;
}

const upload = multer({
  storage: certificateStorage,
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

// Error response helper function
const sendErrorResponse = (res, statusCode, message, details = {}) => {
  const errorResponse = {
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  return res.status(statusCode).json(errorResponse);
};

// File validation helper function
const validateCertificateFile = async (certificateId, filePath) => {
  try {
    // Check if file exists
    const stats = await fs.stat(filePath);
    
    if (!stats.isFile()) {
      return {
        exists: false,
        readable: false,
        error: 'Path is not a file'
      };
    }
console.log("hii")
    // Check file permissions
    try {
      await fs.access(filePath, fs.constants.R_OK);
    } catch (accessError) {
      return {
        exists: true,
        readable: false,
        error: 'File is not readable'
      };
    }

    // Determine MIME type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        mimeType = 'application/pdf';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
    }

    // Basic file integrity check - ensure file is not empty and has reasonable size
    if (stats.size === 0) {
      return {
        exists: true,
        readable: true,
        size: stats.size,
        mimeType,
        lastModified: stats.mtime,
        error: 'File is empty'
      };
    }

    // Check for reasonable file size (not too large, suggesting corruption)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (stats.size > maxSize) {
      return {
        exists: true,
        readable: true,
        size: stats.size,
        mimeType,
        lastModified: stats.mtime,
        error: 'File size exceeds maximum limit'
      };
    }

    return {
      exists: true,
      readable: true,
      size: stats.size,
      mimeType,
      lastModified: stats.mtime,
      error: null
    };

  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        exists: false,
        readable: false,
        error: 'File does not exist'
      };
    }
    
    return {
      exists: false,
      readable: false,
      error: error.message
    };
  }
};

// Get all certificates with filtering and pagination
const getCertificates = async (req, res) => {
  try {
    console.log('📋 getCertificates called');
    console.log('👤 User:', req.user?.email, 'Role:', req.user?.role);
    console.log('👤 User fullName:', req.user?.fullName);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    // If this is a student (not staff), filter by student name or ID
    if (req.user && req.user.role === 'student') {
      console.log('🎓 Filtering certificates for student');
      console.log('🎓 Student ID:', req.user._id);
      console.log('🎓 Student name:', req.user.fullName);
      
      // Filter by student ID OR student name (case-insensitive)
      filter.$or = [
        { studentId: req.user._id },
        { studentName: { $regex: new RegExp(`^${req.user.fullName}$`, 'i') } }
      ];
      
      console.log('🔍 Filter:', JSON.stringify(filter));
    }
    
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

    console.log('🔍 Final filter:', JSON.stringify(filter));

    const certificates = await Certificate.find(filter)
      .populate('studentId', 'fullName studentId email phone')
      .populate('templateId', 'name type')
      .populate('issuedBy', 'name email')
      .sort({ issuedDate: -1 })
      .skip(skip)
      .limit(limit);

    console.log('📊 Found certificates:', certificates.length);

    const total = await Certificate.countDocuments(filter);

    // Add image URL for certificates
    const certificatesWithImages = certificates.map(cert => {
      const certObj = cert.toObject();
      if (certObj.filePath) {
        // Check if it's a Cloudinary URL (starts with http/https)
        if (certObj.filePath.startsWith('http://') || certObj.filePath.startsWith('https://')) {
          certObj.imageUrl = certObj.filePath; // Use Cloudinary URL directly
          console.log('☁️ Certificate with Cloudinary URL:', certObj.verificationCode, '→', certObj.imageUrl);
        } else {
          // Local file - normalize path
          let cleanPath = certObj.filePath.replace(/\\/g, '/');
          const filename = cleanPath.split('/').pop();
          certObj.imageUrl = `/uploads/certificates/${filename}`;
          console.log('📄 Certificate with local file:', certObj.verificationCode, '→', certObj.imageUrl);
        }
      }
      return certObj;
    });

    console.log('✅ Returning', certificatesWithImages.length, 'certificates');

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
    console.error('❌ Error fetching certificates:', error);
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
      // Check if it's a Cloudinary URL (starts with http/https)
      if (certObj.filePath.startsWith('http://') || certObj.filePath.startsWith('https://')) {
        certObj.imageUrl = certObj.filePath; // Use Cloudinary URL directly
      } else {
        // Local file - normalize path
        let cleanPath = certObj.filePath.replace(/\\/g, '/');
        const filename = cleanPath.split('/').pop();
        certObj.imageUrl = `/uploads/certificates/${filename}`;
      }
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
    console.log('📝 ========== Certificate Creation Request ==========');
    console.log('📝 Request body:', req.body);
    console.log('📝 Request file:', req.file);
    console.log('📝 Content-Type:', req.headers['content-type']);
    console.log('📝 ================================================');
    
    // Check for validation errors
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

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

    console.log('📝 Certificate creation request:', {
      studentName,
      instructorName,
      achievementType,
      achievementTitle,
      customVerificationCode
    });

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

    console.log('📁 Checking for uploaded file...');
    console.log('📁 req.file exists:', !!req.file);
    
    if (req.file) {
      // Check if using Cloudinary or local storage
      if (req.file.path && req.file.path.includes('cloudinary')) {
        // Cloudinary upload - use the secure URL
        filePath = req.file.path; // This is the Cloudinary URL
        fileSize = req.file.size;
        fileHash = crypto.createHash('sha256').update(req.file.filename).digest('hex');
        console.log('☁️ File uploaded to Cloudinary:', {
          originalName: req.file.originalname,
          size: fileSize,
          cloudinaryUrl: filePath,
          publicId: req.file.filename
        });
      } else {
        // Local upload - normalize path
        const filename = req.file.filename;
        filePath = `uploads/certificates/${filename}`;
        
        // Read file for hash using the actual file system path
        const actualFilePath = req.file.path;
        const fileBuffer = await fs.readFile(actualFilePath);
        fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        fileSize = req.file.size;
        console.log('📁 File uploaded locally:', {
          originalName: req.file.originalname,
          size: fileSize,
          storedPath: filePath,
          actualPath: actualFilePath,
          filename: filename
        });
      }
    } else {
      console.log('⚠️ WARNING: No file was uploaded! req.file is undefined');
      console.log('⚠️ This means multer did not receive the file');
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

    console.log('💾 Creating certificate with data:', certificateData);

    // Create certificate
    const certificate = new Certificate(certificateData);
    await certificate.save();

    console.log('✅ Certificate created successfully:', certificate._id);

    // Populate the created certificate
    const populatedCertificate = await Certificate.findById(certificate._id)
      .populate('issuedBy', 'name email');

    const certObj = populatedCertificate.toObject();
    if (certObj.filePath) {
      // Normalize path: remove any duplicate paths and use forward slashes
      let cleanPath = certObj.filePath.replace(/\\/g, '/');
      // Extract just the filename
      const filename = cleanPath.split('/').pop();
      certObj.imageUrl = `/uploads/certificates/${filename}`;
    }

    res.status(201).json({
      status: 'success',
      message: 'Certificate created successfully',
      data: { certificate: certObj }
    });
  } catch (error) {
    console.error('❌ Error creating certificate:', error);
    console.error('Stack trace:', error.stack);
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
      status,
      verificationCode
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
    
    // Update verification code if provided (case-insensitive, accepts any format)
    if (verificationCode) {
      // Check if the new verification code already exists (excluding current certificate)
      const existingCert = await Certificate.findOne({ 
        verificationCode: verificationCode.toUpperCase(),
        _id: { $ne: certificate._id }
      });
      
      if (existingCert) {
        return res.status(400).json({
          status: 'error',
          message: 'Verification code already exists. Please use a different code.'
        });
      }
      
      certificate.verificationCode = verificationCode.toUpperCase();
    }

    // Handle file upload if new file provided
    if (req.file) {
      // Delete old file if exists
      if (certificate.filePath) {
        try {
          // Check if old file is on Cloudinary
          if (certificate.filePath.startsWith('http://') || certificate.filePath.startsWith('https://')) {
            // Extract public_id from Cloudinary URL and delete
            const urlParts = certificate.filePath.split('/');
            const publicIdWithExt = urlParts.slice(-2).join('/'); // folder/filename
            const publicId = publicIdWithExt.split('.')[0]; // Remove extension
            await cloudinary.uploader.destroy(publicId);
            console.log('☁️ Deleted old file from Cloudinary:', publicId);
          } else {
            // Delete local file
            const oldFilePath = certificate.filePath.replace(/\\/g, '/');
            const oldFilename = oldFilePath.split('/').pop();
            const actualOldPath = path.join('uploads', 'certificates', oldFilename);
            await fs.unlink(actualOldPath);
            console.log('📁 Deleted old local file:', actualOldPath);
          }
        } catch (err) {
          console.log('⚠️ Old file not found or already deleted:', err.message);
        }
      }

      // Save new file path
      if (req.file.path && req.file.path.includes('cloudinary')) {
        // Cloudinary upload
        certificate.filePath = req.file.path;
        certificate.fileHash = crypto.createHash('sha256').update(req.file.filename).digest('hex');
        certificate.metadata.fileSize = req.file.size;
        console.log('☁️ Updated with Cloudinary file:', req.file.path);
      } else {
        // Local upload
        const filename = req.file.filename;
        certificate.filePath = `uploads/certificates/${filename}`;
        const fileBuffer = await fs.readFile(req.file.path);
        certificate.fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        certificate.metadata.fileSize = req.file.size;
        console.log('📁 Updated with local file:', certificate.filePath);
      }
    }

    await certificate.save();

    const updatedCertificate = await Certificate.findById(certificate._id)
      .populate('issuedBy', 'name email');

    const certObj = updatedCertificate.toObject();
    if (certObj.filePath) {
      // Check if it's a Cloudinary URL
      if (certObj.filePath.startsWith('http://') || certObj.filePath.startsWith('https://')) {
        certObj.imageUrl = certObj.filePath;
      } else {
        // Local file
        let cleanPath = certObj.filePath.replace(/\\/g, '/');
        const filename = cleanPath.split('/').pop();
        certObj.imageUrl = `/uploads/certificates/${filename}`;
      }
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
        // Check if file is on Cloudinary
        if (certificate.filePath.startsWith('http://') || certificate.filePath.startsWith('https://')) {
          // Extract public_id from Cloudinary URL and delete
          const urlParts = certificate.filePath.split('/');
          const publicIdWithExt = urlParts.slice(-2).join('/'); // folder/filename
          const publicId = publicIdWithExt.split('.')[0]; // Remove extension
          await cloudinary.uploader.destroy(publicId);
          console.log('☁️ Deleted file from Cloudinary:', publicId);
        } else {
          // Delete local file
          const cleanPath = certificate.filePath.replace(/\\/g, '/');
          const filename = cleanPath.split('/').pop();
          const actualPath = path.join('uploads', 'certificates', filename);
          await fs.unlink(actualPath);
          console.log('📁 Deleted local file:', actualPath);
        }
      } catch (err) {
        console.log('⚠️ File not found or already deleted:', err.message);
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
    const certificateId = req.params.id;
    
    // Validate certificate ID format (MongoDB ObjectId)
    if (!certificateId || !certificateId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`Invalid certificate ID format: ${certificateId}`);
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid certificate ID format'
      });
    }

    // Find certificate in database
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      console.log(`Certificate not found in database: ${certificateId}`);
      return res.status(404).json({
        status: 'error',
        code: 'CERT_NOT_FOUND',
        message: 'Certificate not found'
      });
    }

    // Check if certificate has a file path
    if (!certificate.filePath) {
      console.log(`Certificate has no file path: ${certificateId}`);
      return res.status(404).json({
        status: 'error',
        code: 'FILE_PATH_MISSING',
        message: 'Certificate file path not found'
      });
    }

    // Validate file existence and accessibility
    const fileValidation = await validateCertificateFile(certificateId, certificate.filePath);
    if (!fileValidation.exists) {
      console.log(`Certificate file does not exist: ${certificate.filePath}`);
      return res.status(404).json({
        status: 'error',
        code: 'FILE_NOT_FOUND',
        message: 'Certificate file not found on server'
      });
    }

    if (!fileValidation.readable) {
      console.error(`Certificate file not readable: ${certificate.filePath}`);
      return res.status(500).json({
        status: 'error',
        code: 'FILE_ACCESS_ERROR',
        message: 'Certificate file cannot be accessed'
      });
    }

    // Check for file corruption
    if (fileValidation.error) {
      console.error(`Certificate file validation error: ${fileValidation.error}`);
      return res.status(422).json({
        status: 'error',
        code: 'FILE_CORRUPTED',
        message: 'Certificate file appears to be corrupted'
      });
    }

    // Set appropriate HTTP headers for file download
    const fileName = `certificate_${certificate.verificationCode}${path.extname(certificate.filePath)}`;
    const mimeType = fileValidation.mimeType || 'application/octet-stream';
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileValidation.size);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Add CORS headers for frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');

    // Log successful download request
    console.log(`Certificate download initiated: ${certificateId} by ${req.ip || 'unknown'}`);
    
    // Increment download count
    await certificate.incrementDownloadCount();

    // Send file
    res.download(certificate.filePath, fileName, (err) => {
      if (err) {
        console.error(`Error sending certificate file: ${err.message}`);
        if (!res.headersSent) {
          return res.status(500).json({
            status: 'error',
            code: 'DOWNLOAD_FAILED',
            message: 'Failed to download certificate file'
          });
        }
      } else {
        console.log(`Certificate download completed: ${certificateId}`);
      }
    });

  } catch (error) {
    console.error('Error downloading certificate:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_ID',
        message: 'Invalid certificate ID format'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Internal server error occurred'
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
  validateCertificateFile,
  sendErrorResponse,
  upload
};