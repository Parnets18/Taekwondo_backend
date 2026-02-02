const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const CertificateService = require('../services/CertificateService');
const QRCode = require('qrcode');
const path = require('path');
const { protect, adminOnly, staffOnly } = require('../middleware/auth');

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

    // Sample verification data for demo - EXACT match to image design
    const sampleVerifications = {
      'CERT-2026-00123': {
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
        status: 'Issued'
      },
      'CERT-2025-00456': {
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
        status: 'Issued'
      },
      'CERT-2025-00789': {
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
        status: 'Issued'
      },
      'CERT-2025-00321': {
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
        status: 'Issued'
      },
      'CERT-4125362': {
        id: 'CERT-4125362',
        student: 'Golu Vishwakarma',
        studentName: 'Golu Vishwakarma',
        title: 'red belt',
        achievementType: 'red belt',
        type: 'Belt Promotion',
        category: 'red belt',
        beltLevel: 'red belt',
        issuedDate: new Date('2025-01-23'),
        formattedIssueDate: 'Jan 23, 2025',
        verificationCode: 'CERT-4125362',
        status: 'Issued'
      },
      'CERT-NAV123': {
        id: 'CERT-NAV123',
        student: 'sxsa',
        studentName: 'sxsa',
        title: 'jxbashv',
        achievementType: 'jxbashv',
        type: 'Achievement',
        category: 'hov',
        beltLevel: 'hov',
        issuedDate: new Date('2025-01-22'),
        formattedIssueDate: 'Jan 22, 2025',
        verificationCode: 'CERT-NAV123',
        status: 'Issued'
      },
      'CERT-CRFT123': {
        id: 'CERT-CRFT123',
        student: 'Arjun Sharma',
        studentName: 'Arjun Sharma',
        title: 'edweded',
        achievementType: 'edweded',
        type: 'Achievement',
        category: 'erferf',
        beltLevel: 'erferf',
        issuedDate: new Date('2025-01-20'),
        formattedIssueDate: 'Jan 20, 2025',
        verificationCode: 'CERT-CRFT123',
        status: 'Issued'
      }
    };

    const certificate = sampleVerifications[verificationCode.toUpperCase()];

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found or invalid verification code'
      });
    }

    console.log('✅ Certificate verified successfully:', certificate);

    res.json({
      status: 'success',
      data: certificate
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
router.get('/', protect, async (req, res) => {
  try {
    console.log('🔐 Authenticated certificates request from user:', req.user.id);
    console.log('👤 User details:', { id: req.user.id, email: req.user.email, role: req.user.role });
    
    const { studentId } = req.query;
    
    // If user is admin/staff, they can query any student's certificates
    // If user is student, they can only see their own certificates
    let queryUserId = req.user.id;
    
    if (studentId && (req.user.role === 'admin' || req.user.role === 'instructor')) {
      queryUserId = studentId;
      console.log('🔍 Admin/Staff querying certificates for student:', studentId);
    } else if (studentId && studentId !== req.user.id) {
      console.log('❌ User trying to access other student certificates');
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view your own certificates.'
      });
    }

    // Try to get certificates from database
    let certificates = [];
    
    try {
      // In a real implementation, you would query the database:
      // certificates = await Certificate.find({ studentId: queryUserId, isActive: true });
      
      // For now, return user-specific sample data based on authenticated user
      certificates = await getUserCertificates(req.user);
      
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Return sample data if database query fails
      certificates = await getUserCertificates(req.user);
    }

    console.log('✅ Returning certificates for user:', certificates.length);

    res.json({
      status: 'success',
      data: {
        certificates: certificates,
        user: {
          id: req.user.id,
          name: req.user.name || req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    console.error('Error fetching authenticated certificates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch certificates'
    });
  }
});

// Helper function to get user-specific certificates
async function getUserCertificates(user) {
  // Return certificates that match the admin panel data format
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
      year: 2025,
      userId: user.id,
      actions: ['view', 'edit', 'download', 'delete']
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
      year: 2025,
      userId: user.id,
      actions: ['view', 'edit', 'download', 'delete']
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
      year: 2025,
      userId: user.id,
      actions: ['view', 'edit', 'download', 'delete']
    }
  ];

  // If user is authenticated, return their specific certificates
  // For demo, we'll return all certificates but you can filter by user.id
  return adminPanelCertificates;
}

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

    // Sample verification data for demo - EXACT match to image design
    const sampleVerifications = {
      'CERT-2026-00123': {
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
        status: 'Issued'
      },
      'CERT-2025-00456': {
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
        status: 'Issued'
      },
      'CERT-2025-00789': {
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
        status: 'Issued'
      },
      'CERT-2025-00321': {
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
        status: 'Issued'
      }
    };

    const certificate = sampleVerifications[verificationCode.toUpperCase()];

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found or invalid verification code'
      });
    }

    console.log('✅ Certificate verified successfully:', certificate);

    res.json({
      status: 'success',
      data: certificate
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
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, you would:
    // 1. Find the certificate by ID
    // 2. Check permissions
    // 3. Return the actual PDF file
    
    // For demo, return a placeholder response
    res.json({
      status: 'success',
      message: 'Certificate download would be available here',
      data: {
        certificateId: id,
        downloadUrl: `/uploads/certificates/certificate_${id}.pdf`
      }
    });

  } catch (error) {
    console.error('Certificate download failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download certificate'
    });
  }
});

/**
 * GET /api/certificates/statistics
 * Get certificate statistics (public endpoint for testing)
 */
router.get('/statistics', async (req, res) => {
  try {
    console.log('📊 Loading certificate statistics...');
    
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
    console.error('Error fetching certificate statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch certificate statistics'
    });
  }
});

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