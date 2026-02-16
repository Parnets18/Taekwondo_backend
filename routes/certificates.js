const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const CertificateService = require('../services/CertificateService');
const QRCode = require('qrcode');
const path = require('path');
const { protect, adminOnly, staffOnly } = require('../middleware/auth');
const certificateController = require('../controllers/certificateController');

const certificateService = new CertificateService();

/**
 * POST /api/certificates/verify
 * Verify certificate (public endpoint)
 */
router.post('/verify', async (req, res) => {
  try {
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification code is required'
      });
    }

    console.log('🔍 Verifying certificate with code:', verificationCode);

    // Query the database for the certificate
    const certificate = await Certificate.findOne({ 
      verificationCode: verificationCode.toUpperCase() 
    }).populate('studentId', 'name');

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found or invalid verification code'
      });
    }

    console.log('✅ Certificate verified successfully:', certificate.verificationCode);

    // Format response to match frontend expectations
    const responseData = {
      isValid: true,
      certificate: {
        id: certificate.id || certificate._id.toString(),
        studentName: certificate.studentName,
        achievementType: certificate.achievementType,
        achievementDetails: {
          title: certificate.achievementDetails?.title || certificate.achievementType,
          description: certificate.achievementDetails?.description || '',
          level: certificate.achievementDetails?.level || '',
          grade: certificate.achievementDetails?.grade || '',
          examiner: certificate.achievementDetails?.examiner || certificate.metadata?.instructorName || 'Academy Director'
        },
        issuedDate: certificate.issuedDate,
        verificationCode: certificate.verificationCode,
        status: certificate.status,
        hasFile: !!certificate.filePath
      }
    };

    res.json({
      status: 'success',
      data: responseData
    });

  } catch (error) {
    console.error('Certificate verification failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Verification service temporarily unavailable'
    });
  }
});

/**
 * POST /api/certificates
 * Create new certificate with file upload (admin only)
 * Requires admin authentication and multipart/form-data
 */
router.post('/', protect, adminOnly, certificateController.upload.single('certificateImage'), certificateController.createCertificate);

/**
 * GET /api/certificates/public
 * POST /api/certificates/pubor demo/testing)
 */
router.get('/public', async (req, res) => {
  try {
    // Return certificates matching the admin panel data - EXACT match to admin panel
    const adminPanelCertificates = [
      {
        id: 'CERT-4125362',
        student: 'Golu Vishwakarma',
        studentName: 'Golu Vishwakarma',
        title: 'red belt',
        achievementType: 'red belt',
        type: 'Belt Promotion',
        category: 'red belt',
        beltLevel: 'red belt',
        level: 'red belt',
        code: '4125362',
        issuedDate: new Date('2025-01-23'),
        formattedIssueDate: 'Jan 23, 2025',
        verificationCode: 'CERT-4125362',
        status: 'Issued',
        year: 2025
      },
      {
        id: 'CERT-NAV123',
        student: 'sxsa',
        studentName: 'sxsa',
        title: 'jxbashv',
        achievementType: 'jxbashv',
        type: 'Achievement',
        category: 'hov',
        beltLevel: 'hov',
        level: 'hov',
        code: 'NAV123',
        issuedDate: new Date('2025-01-22'),
        formattedIssueDate: 'Jan 22, 2025',
        verificationCode: 'CERT-NAV123',
        status: 'Issued',
        year: 2025
      },
      {
        id: 'CERT-CRFT123',
        student: 'Arjun Sharma',
        studentName: 'Arjun Sharma',
        title: 'edweded',
        achievementType: 'edweded',
        type: 'Achievement',
        category: 'erferf',
        beltLevel: 'erferf',
        level: 'erferf',
        code: 'CRFT123',
        issuedDate: new Date('2025-01-20'),
        formattedIssueDate: 'Jan 20, 2025',
        verificationCode: 'CERT-CRFT123',
        status: 'Issued',
        year: 2025
      }
    ];

    res.json({
      status: 'success',
      data: {
        certificates: adminPanelCertificates
      }
    });
  } catch (error) {
    console.error('Error fetching public certificates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch certificates'
    });
  }
});

/**
 * GET /api/certificates
 * Get certificates for authenticated user
 * Requires authentication
 */
router.get('/', protect, certificateController.getCertificates);

/**
 * GET /api/certificates/admin/all
 * Get all certificates (admin only)
 * Requires admin authentication
 */
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    console.log('🔐 Admin certificates request from:', req.user.email);
    
    // In a real implementation, you would query all certificates from database
    // const certificates = await Certificate.find({}).populate('student');
    
    // For now, return comprehensive sample data for admin panel
    const allCertificates = [
      {
        id: 'CERT-2026-00123',
        student: 'Rahul Kumar',
        studentName: 'Rahul Kumar',
        title: 'Gold Medal',
        achievementType: 'Gold Medal',
        type: 'Tournament',
        category: 'State Level Competition',
        beltLevel: 'State Level Competition',
        issuedDate: new Date('2026-01-20'),
        formattedIssueDate: 'Jan 20, 2026',
        verificationCode: 'CERT-2026-00123',
        status: 'Issued',
        year: 2026,
        createdBy: 'admin',
        createdAt: new Date('2026-01-20')
      },
      {
        id: 'CERT-2025-00456',
        student: 'Priya Sharma',
        studentName: 'Priya Sharma',
        title: 'Silver Medal',
        achievementType: 'Silver Medal',
        type: 'Tournament',
        category: 'Regional Championship',
        beltLevel: 'Regional Championship',
        issuedDate: new Date('2025-12-15'),
        formattedIssueDate: 'Dec 15, 2025',
        verificationCode: 'CERT-2025-00456',
        status: 'Issued',
        year: 2025,
        createdBy: 'admin',
        createdAt: new Date('2025-12-15')
      },
      {
        id: 'CERT-2025-00789',
        student: 'Arjun Singh',
        studentName: 'Arjun Singh',
        title: 'Black Belt Promotion',
        achievementType: 'Black Belt Promotion',
        type: 'Belt Promotion',
        category: '1st Dan Black Belt',
        beltLevel: '1st Dan Black Belt',
        issuedDate: new Date('2025-11-10'),
        formattedIssueDate: 'Nov 10, 2025',
        verificationCode: 'CERT-2025-00789',
        status: 'Issued',
        year: 2025,
        createdBy: 'admin',
        createdAt: new Date('2025-11-10')
      },
      {
        id: 'CERT-2025-00321',
        student: 'Sneha Patel',
        studentName: 'Sneha Patel',
        title: 'Perfect Attendance Award',
        achievementType: 'Perfect Attendance Award',
        type: 'Achievement',
        category: 'Annual Achievement',
        beltLevel: 'Annual Achievement',
        issuedDate: new Date('2025-10-05'),
        formattedIssueDate: 'Oct 05, 2025',
        verificationCode: 'CERT-2025-00321',
        status: 'Issued',
        year: 2025,
        createdBy: 'admin',
        createdAt: new Date('2025-10-05')
      }
    ];

    res.json({
      status: 'success',
      data: {
        certificates: allCertificates,
        total: allCertificates.length,
        admin: req.user.email
      }
    });
  } catch (error) {
    console.error('Error fetching admin certificates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch certificates for admin'
    });
  }
});

/**
 * POST /api/certificates/admin/create
 * Create new certificate (admin only)
 * Requires admin authentication
 */
router.post('/admin/create', protect, adminOnly, async (req, res) => {
  try {
    console.log('🔐 Admin creating certificate:', req.body);
    
    const {
      studentName,
      title,
      achievementType,
      category,
      beltLevel,
      type = 'Achievement'
    } = req.body;

    // Validate required fields
    if (!studentName || !title || !achievementType) {
      return res.status(400).json({
        status: 'error',
        message: 'Student name, title, and achievement type are required'
      });
    }

    // Generate certificate ID
    const certificateId = `CERT-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    
    const newCertificate = {
      id: certificateId,
      student: studentName,
      studentName: studentName,
      title: title,
      achievementType: achievementType,
      type: type,
      category: category || achievementType,
      beltLevel: beltLevel || category || achievementType,
      issuedDate: new Date(),
      formattedIssueDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      verificationCode: certificateId,
      status: 'Issued',
      year: new Date().getFullYear(),
      createdBy: req.user.email,
      createdAt: new Date()
    };

    // In a real implementation, you would save to database:
    // const certificate = new Certificate(newCertificate);
    // await certificate.save();

    console.log('✅ Certificate created:', certificateId);

    res.status(201).json({
      status: 'success',
      message: 'Certificate created successfully',
      data: {
        certificate: newCertificate
      }
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create certificate'
    });
  }
});

/**
 * DELETE /api/certificates/:id
 * Delete certificate (admin only)
 * Requires admin authentication
 */
router.delete('/:id', protect, adminOnly, certificateController.deleteCertificate);

/**
 * PUT /api/certificates/:id
 * Update certificate (admin only)
 * Requires admin authentication
 */
router.put('/:id', protect, adminOnly, certificateController.upload.single('certificateImage'), certificateController.updateCertificate);

/**
 * GET /api/certificates/:id/qr
 * Generate QR code for certificate verification
 */
router.get('/:id/qr', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generate verification URL
    const baseUrl = process.env.FRONTEND_URL || 'https://taekwondo-academy.com';
    const verificationUrl = `${baseUrl}/verify/${id}`;
    
    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    res.json({
      status: 'success',
      data: {
        qrCode: qrCodeDataURL,
        verificationUrl: verificationUrl,
        certificateId: id
      }
    });

  } catch (error) {
    console.error('QR code generation failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate QR code'
    });
  }
});

/**
 * GET /api/certificates/:id/download
 * Download certificate file
 */
router.get('/:id/download', certificateController.downloadCertificate);

/**
 * GET /api/certificates/statistics
 * Get certificate statistics (public endpoint for testing)
 */
router.get('/statistics', certificateController.getCertificateStatistics);

/**
 * GET /api/certificates/stats
 * Get certificate statistics
 */
router.get('/stats', protect, async (req, res) => {
  try {
    // Sample statistics for demo
    const stats = {
      totalCertificates: 156,
      activeCertificates: 148,
      revokedCertificates: 8,
      byType: {
        'Belt Promotion': 89,
        'Tournament': 34,
        'Course Completion': 21,
        'Achievement': 12
      },
      byYear: {
        '2023': 45,
        '2024': 78,
        '2025': 33
      }
    };

    res.json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch certificate statistics'
    });
  }
});

module.exports = router;