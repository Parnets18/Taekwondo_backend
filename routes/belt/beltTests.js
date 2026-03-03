const express = require('express');
const router = express.Router();

console.log('📝 Belt Tests routes loading...');

const {
  getBeltTests,
  getBeltTestById,
  createBeltTest,
  updateBeltTest,
  deleteBeltTest,
  getBeltTestStatistics,
  downloadCertificate
} = require('../../controllers/belt/beltTestController');

const { protect, adminOnly } = require('../../middleware/auth');
const { uploadBeltExam } = require('../../config/cloudinary');

console.log('📝 Belt Tests routes configured');

// Public routes (for testing/demo)
router.get('/public', async (req, res) => {
  try {
    console.log('📝 Public belt tests route called');
    console.log('📝 Query params:', req.query);
    
    // Try to fetch from database first
    const BeltTest = require('../../models/BeltTest');
    
    try {
      const { status, upcoming, studentName, testingFor } = req.query;
      const filter = {};
      
      // Apply filters
      if (status && status !== 'all') {
        filter.status = status.toLowerCase();
      }
      
      if (upcoming === 'true') {
        filter.testDate = { $gte: new Date() };
        filter.status = 'scheduled';
      }
      
      if (studentName) {
        filter.studentName = { $regex: studentName, $options: 'i' };
      }
      
      if (testingFor) {
        filter.testingFor = { $regex: testingFor, $options: 'i' };
      }
      
      console.log('📝 Database filter:', filter);
      
      // Fetch from database
      const dbTests = await BeltTest.find(filter)
        .sort({ testDate: 1 })
        .limit(50);
      
      console.log(`✅ Found ${dbTests.length} belt tests in database`);
      
      // If database has data, return it
      if (dbTests.length > 0) {
        return res.status(200).json({
          status: 'success',
          data: { 
            tests: dbTests,
            count: dbTests.length,
            source: 'database',
            query: req.query
          }
        });
      }
      
      console.log('⚠️ No tests found in database, using sample data...');
    } catch (dbError) {
      console.log('⚠️ Database query failed, using sample data:', dbError.message);
    }
    
    // Fallback to sample data if database is empty or fails
    const sampleBeltTestsData = [
      {
        _id: 'TEST-001',
        studentName: 'Golu Vishwakarma',
        currentBelt: 'Red Belt',
        testingFor: '1st Dan Black Belt',
        testDate: new Date('2025-03-15'),
        testTime: '10:00 AM',
        location: 'Main Dojo',
        examiner: 'Grand Master Kim',
        status: 'Scheduled',
        registrationDate: new Date('2025-01-20'),
        requirements: [
          'All Taegeuk forms (1-8)',
          'Advanced breaking techniques',
          'Teaching demonstration',
          'Leadership skills assessment',
          'Physical fitness test'
        ],
        testingFee: 3000,
        paymentStatus: 'Paid',
        notes: 'Exceptional student ready for black belt',
        readiness: 95,
        results: null,
        score: null,
        passed: null,
        certificateIssued: false,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date('2025-01-20')
      },
      {
        _id: 'TEST-002',
        studentName: 'Priya Patel',
        currentBelt: 'Blue Belt',
        testingFor: 'Red Belt',
        testDate: new Date('2025-02-28'),
        testTime: '2:00 PM',
        location: 'Training Hall A',
        examiner: 'Master Lee',
        status: 'Scheduled',
        registrationDate: new Date('2025-01-25'),
        requirements: [
          'Taegeuk forms 1-6',
          'Advanced spinning kicks',
          'Tournament sparring',
          'Student mentoring demonstration',
          'Board breaking (3 boards)'
        ],
        testingFee: 1800,
        paymentStatus: 'Paid',
        notes: 'Strong technical skills, good leadership potential',
        readiness: 88,
        results: null,
        score: null,
        passed: null,
        certificateIssued: false,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-25'),
        updatedAt: new Date('2025-01-25')
      },
      {
        _id: 'TEST-003',
        studentName: 'Rahul Kumar',
        currentBelt: 'Green Belt',
        testingFor: 'Blue Belt',
        testDate: new Date('2025-02-15'),
        testTime: '11:00 AM',
        location: 'Main Dojo',
        examiner: 'Master Park',
        status: 'Scheduled',
        registrationDate: new Date('2025-01-28'),
        requirements: [
          'Taegeuk forms 1-5',
          'Jump kicks (front, side, roundhouse)',
          'Advanced sparring techniques',
          'Self-defense combinations',
          'Multiple board breaking'
        ],
        testingFee: 1600,
        paymentStatus: 'Pending',
        notes: 'Needs to improve consistency in forms',
        readiness: 75,
        results: null,
        score: null,
        passed: null,
        certificateIssued: false,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-28'),
        updatedAt: new Date('2025-01-28')
      },
      {
        _id: 'TEST-004',
        studentName: 'Arjun Sharma',
        currentBelt: 'White Belt',
        testingFor: 'Yellow Belt',
        testDate: new Date('2025-01-15'),
        testTime: '3:00 PM',
        location: 'Training Hall B',
        examiner: 'Master Kim',
        status: 'Completed',
        registrationDate: new Date('2024-12-20'),
        requirements: [
          'Basic stances and blocks',
          'Basic punches and kicks',
          'Taegeuk Il Jang form',
          'Basic sparring techniques',
          'Board breaking (1 board)'
        ],
        testingFee: 1000,
        paymentStatus: 'Paid',
        notes: 'Excellent first test performance',
        results: {
          forms: 95,
          techniques: 90,
          sparring: 88,
          breaking: 92,
          overall: 91
        },
        score: 91,
        passed: true,
        certificateIssued: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2025-01-15')
      },
      {
        _id: 'TEST-005',
        studentName: 'Sneha Singh',
        currentBelt: 'Yellow Belt',
        testingFor: 'Orange Belt',
        testDate: new Date('2025-01-10'),
        testTime: '1:00 PM',
        location: 'Main Dojo',
        examiner: 'Master Lee',
        status: 'Completed',
        registrationDate: new Date('2024-12-15'),
        requirements: [
          'All previous requirements',
          'Advanced kicks and combinations',
          'Taegeuk Sam Jang form',
          'Intermediate sparring',
          'Self-defense techniques'
        ],
        testingFee: 1200,
        paymentStatus: 'Paid',
        notes: 'Good improvement since last test',
        results: {
          forms: 87,
          techniques: 85,
          sparring: 89,
          breaking: 83,
          overall: 86
        },
        score: 86,
        passed: true,
        certificateIssued: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-12-15'),
        updatedAt: new Date('2025-01-10')
      }
    ];

    // Apply filters to sample data
    const { status, upcoming, studentName, testingFor } = req.query;
    let filteredData = sampleBeltTestsData;
    
    if (status && status !== 'all') {
      filteredData = filteredData.filter(test => 
        test.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (upcoming === 'true') {
      filteredData = filteredData.filter(test => 
        new Date(test.testDate) >= new Date() && test.status === 'Scheduled'
      );
    }
    
    if (studentName) {
      filteredData = filteredData.filter(test => 
        test.studentName.toLowerCase().includes(studentName.toLowerCase())
      );
    }
    
    if (testingFor) {
      filteredData = filteredData.filter(test => 
        test.testingFor.toLowerCase().includes(testingFor.toLowerCase())
      );
    }
    
    console.log(`✅ Returning ${filteredData.length} belt tests (sample data)`);
    
    res.status(200).json({
      status: 'success',
      data: { 
        tests: filteredData,
        count: filteredData.length,
        source: 'sample',
        query: req.query
      }
    });
  } catch (error) {
    console.error('❌ Error fetching public belt tests:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt tests',
      error: error.message
    });
  }
});

// Public promotions endpoint
router.get('/promotions-public', async (req, res) => {
  try {
    console.log('🏆 Public promotions route called');
    console.log('🏆 Query params:', req.query);
    
    // Try to fetch from database first
    const Promotion = require('../../models/Promotion');
    
    try {
      const { status, studentName, fromBelt, toBelt } = req.query;
      const filter = {};
      
      // Apply filters
      if (status && status !== 'all') {
        filter.status = status.toLowerCase();
      }
      
      if (studentName) {
        filter.studentName = { $regex: studentName, $options: 'i' };
      }
      
      if (fromBelt) {
        filter.fromBelt = { $regex: fromBelt, $options: 'i' };
      }
      
      if (toBelt) {
        filter.toBelt = { $regex: toBelt, $options: 'i' };
      }
      
      console.log('🏆 Database filter:', filter);
      
      // Fetch from database
      const dbPromotions = await Promotion.find(filter)
        .sort({ promotionDate: -1 })
        .limit(50);
      
      console.log(`✅ Found ${dbPromotions.length} promotions in database`);
      
      // If database has data, return it
      if (dbPromotions.length > 0) {
        return res.status(200).json({
          status: 'success',
          data: { 
            promotions: dbPromotions,
            count: dbPromotions.length,
            source: 'database',
            query: req.query
          }
        });
      }
      
      console.log('⚠️ No promotions found in database, using sample data...');
    } catch (dbError) {
      console.log('⚠️ Database query failed, using sample data:', dbError.message);
    }
    
    // Fallback to sample data if database is empty or fails
    const samplePromotionsData = [
      {
        _id: 'PROMO-001',
        studentName: 'Arjun Sharma',
        fromBelt: 'White Belt',
        toBelt: 'Yellow Belt',
        promotionDate: new Date('2025-01-15'),
        testScore: 91,
        examiner: 'Master Kim',
        certificateNumber: 'CERT-YB-2025-001',
        status: 'Completed',
        notes: 'Excellent performance in first belt test',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15')
      },
      {
        _id: 'PROMO-002',
        studentName: 'Sneha Singh',
        fromBelt: 'Yellow Belt',
        toBelt: 'Orange Belt',
        promotionDate: new Date('2025-01-10'),
        testScore: 86,
        examiner: 'Master Lee',
        certificateNumber: 'CERT-OB-2025-001',
        status: 'Completed',
        notes: 'Good improvement in technique and form',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-10')
      },
      {
        _id: 'PROMO-003',
        studentName: 'Golu Vishwakarma',
        fromBelt: 'Red Belt',
        toBelt: '1st Dan Black Belt',
        promotionDate: new Date('2025-03-15'),
        testScore: null,
        examiner: 'Grand Master Kim',
        certificateNumber: null,
        status: 'Scheduled',
        notes: 'Preparing for black belt examination',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date('2025-01-20')
      },
      {
        _id: 'PROMO-004',
        studentName: 'Priya Patel',
        fromBelt: 'Blue Belt',
        toBelt: 'Red Belt',
        promotionDate: new Date('2025-02-28'),
        testScore: null,
        examiner: 'Master Lee',
        certificateNumber: null,
        status: 'Scheduled',
        notes: 'Strong candidate for red belt promotion',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-25'),
        updatedAt: new Date('2025-01-25')
      },
      {
        _id: 'PROMO-005',
        studentName: 'Rahul Kumar',
        fromBelt: 'Green Belt',
        toBelt: 'Blue Belt',
        promotionDate: new Date('2025-02-15'),
        testScore: null,
        examiner: 'Master Park',
        certificateNumber: null,
        status: 'Scheduled',
        notes: 'Needs to work on form consistency',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-28'),
        updatedAt: new Date('2025-01-28')
      }
    ];

    // Apply filters to sample data
    const { status, studentName, fromBelt, toBelt } = req.query;
    let filteredData = samplePromotionsData;
    
    if (status && status !== 'all') {
      filteredData = filteredData.filter(promo => 
        promo.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (studentName) {
      filteredData = filteredData.filter(promo => 
        promo.studentName.toLowerCase().includes(studentName.toLowerCase())
      );
    }
    
    if (fromBelt) {
      filteredData = filteredData.filter(promo => 
        promo.fromBelt.toLowerCase().includes(fromBelt.toLowerCase())
      );
    }
    
    if (toBelt) {
      filteredData = filteredData.filter(promo => 
        promo.toBelt.toLowerCase().includes(toBelt.toLowerCase())
      );
    }
    
    console.log(`✅ Returning ${filteredData.length} promotions (sample data)`);
    
    res.status(200).json({
      status: 'success',
      data: { 
        promotions: filteredData,
        count: filteredData.length,
        source: 'sample',
        query: req.query
      }
    });
  } catch (error) {
    console.error('❌ Error fetching public promotions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch promotions',
      error: error.message
    });
  }
});

// All routes require authentication
router.use(protect);

// GET routes (authenticated users)
router.get('/', getBeltTests);
router.get('/statistics', getBeltTestStatistics);
router.get('/:id/certificate/download', downloadCertificate);
router.get('/:id', getBeltTestById);

// Admin only routes with error handling
router.post('/', adminOnly, (req, res, next) => {
  uploadBeltExam.single('certificateFile')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer upload error:', err);
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload failed',
        error: err.message
      });
    }
    next();
  });
}, createBeltTest);

router.put('/:id', adminOnly, (req, res, next) => {
  uploadBeltExam.single('certificateFile')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer upload error:', err);
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File upload failed',
        error: err.message
      });
    }
    next();
  });
}, updateBeltTest);

router.delete('/:id', adminOnly, deleteBeltTest);

module.exports = router;
