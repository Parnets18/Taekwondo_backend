const express = require('express');
const router = express.Router();

console.log('🏆 Promotions routes loading...');

const {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionStatistics
} = require('../../controllers/belt/promotionController');

const { protect, adminOnly } = require('../../middleware/auth');

console.log('🏆 Promotions routes configured');

// Public routes (for testing/demo) - MUST be before protect middleware
router.get('/public', async (req, res) => {
  try {
    console.log('🏆 Public promotions route called');
    console.log('🏆 Query params:', req.query);
    
    // Try to fetch from database first
    const Promotion = require('../../models/Promotion');
    
    try {
      const { studentName, fromBelt, toBelt, limit } = req.query;
      const filter = {};
      
      // Apply filters
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
        .limit(parseInt(limit) || 50);
      
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
        studentId: 'STU-001',
        studentName: 'Rahul Kumar',
        fromBelt: 'White Belt',
        toBelt: 'Yellow Belt',
        promotionDate: new Date('2025-01-15'),
        testScore: 88,
        instructor: 'Master Kim',
        notes: 'Excellent performance in all areas. Strong basics.',
        status: 'Completed',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15')
      },
      {
        _id: 'PROMO-002',
        studentId: 'STU-002',
        studentName: 'Priya Sharma',
        fromBelt: 'Yellow Belt',
        toBelt: 'Orange Belt',
        promotionDate: new Date('2025-01-20'),
        testScore: 92,
        instructor: 'Master Lee',
        notes: 'Outstanding technique and discipline. Very promising student.',
        status: 'Completed',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date('2025-01-20')
      },
      {
        _id: 'PROMO-003',
        studentId: 'STU-003',
        studentName: 'Amit Patel',
        fromBelt: 'Orange Belt',
        toBelt: 'Green Belt',
        promotionDate: new Date('2025-01-25'),
        testScore: 85,
        instructor: 'Master Park',
        notes: 'Good progress. Needs to work on flexibility.',
        status: 'Completed',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-25'),
        updatedAt: new Date('2025-01-25')
      },
      {
        _id: 'PROMO-004',
        studentId: 'STU-004',
        studentName: 'Sneha Singh',
        fromBelt: 'Green Belt',
        toBelt: 'Blue Belt',
        promotionDate: new Date('2025-02-01'),
        testScore: 95,
        instructor: 'Master Kim',
        notes: 'Exceptional student with perfect form execution.',
        status: 'Completed',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date('2025-02-01')
      },
      {
        _id: 'PROMO-005',
        studentId: 'STU-005',
        studentName: 'Vikram Reddy',
        fromBelt: 'Blue Belt',
        toBelt: 'Purple Belt',
        promotionDate: new Date('2025-02-05'),
        testScore: 90,
        instructor: 'Master Lee',
        notes: 'Great leadership potential. Strong sparring skills.',
        status: 'Completed',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-02-05'),
        updatedAt: new Date('2025-02-05')
      }
    ];
    
    console.log(`✅ Returning ${samplePromotionsData.length} sample promotions`);
    
    res.status(200).json({
      status: 'success',
      data: { 
        promotions: samplePromotionsData,
        count: samplePromotionsData.length,
        source: 'sample',
        query: req.query
      }
    });
  } catch (error) {
    console.error('❌ Error in public promotions route:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch promotions',
      error: error.message
    });
  }
});

// All routes below require authentication
router.use(protect);

// GET routes (authenticated users)
router.get('/', getPromotions);
router.get('/statistics', getPromotionStatistics);
router.get('/:id', getPromotionById);

// Admin only routes
router.post('/', adminOnly, createPromotion);
router.put('/:id', adminOnly, updatePromotion);
router.delete('/:id', adminOnly, deletePromotion);

module.exports = router;
