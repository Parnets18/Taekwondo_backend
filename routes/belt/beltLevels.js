const express = require('express');
const router = express.Router();

console.log('🥋 Belt Levels routes loading...');

const {
  getBeltLevels,
  getBeltById,
  createBelt,
  updateBelt,
  deleteBelt,
  getBeltStatistics
} = require('../../controllers/belt/beltLevelController');

const { protect, adminOnly } = require('../../middleware/auth');

console.log('🥋 Belt Levels routes configured');

// Public routes (for testing/demo)
router.get('/public', async (req, res) => {
  try {
    console.log('🥋 Public belt levels route called');
    
    // Return sample belt levels data
    const sampleBeltLevelsData = [
      {
        _id: 'BELT-001',
        name: 'White Belt',
        level: 1,
        color: '#FFFFFF',
        colorCode: '#FFFFFF',
        order: 1,
        category: 'Colored Belt',
        requirements: [
          'Basic stances (Ready stance, Attention stance)',
          'Basic blocks (Low block, Middle block, High block)',
          'Basic punches (Straight punch, Reverse punch)',
          'Basic kicks (Front kick, Side kick)',
          'Basic forms (Taegeuk Il Jang)'
        ],
        minimumTrainingHours: 40,
        minimumAge: 6,
        testingFee: 800,
        description: 'Foundation level focusing on basic techniques and discipline',
        status: 'Active',
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: 'BELT-002',
        name: 'Yellow Belt',
        level: 2,
        color: '#FFD700',
        colorCode: '#FFD700',
        order: 2,
        category: 'Colored Belt',
        requirements: [
          'All White Belt requirements',
          'Advanced stances (Walking stance, Back stance)',
          'Combination techniques',
          'Basic sparring techniques',
          'Forms (Taegeuk Ee Jang)',
          'Breaking techniques (Board breaking)'
        ],
        minimumTrainingHours: 60,
        minimumAge: 7,
        testingFee: 1000,
        description: 'Building upon basics with more complex movements',
        status: 'Active',
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: 'BELT-003',
        name: 'Orange Belt',
        level: 3,
        color: '#FFA500',
        colorCode: '#FFA500',
        order: 3,
        category: 'Colored Belt',
        requirements: [
          'All previous belt requirements',
          'Advanced kicks (Roundhouse kick, Hook kick)',
          'Counter-attack techniques',
          'Intermediate sparring',
          'Forms (Taegeuk Sam Jang)',
          'Self-defense techniques'
        ],
        minimumTrainingHours: 80,
        minimumAge: 8,
        testingFee: 1200,
        description: 'Intermediate level with focus on precision and timing',
        status: 'Active',
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: 'BELT-004',
        name: 'Green Belt',
        level: 4,
        color: '#008000',
        colorCode: '#008000',
        order: 4,
        category: 'Colored Belt',
        requirements: [
          'All previous belt requirements',
          'Advanced combinations',
          'Jump kicks (Jump front kick, Jump side kick)',
          'Advanced sparring techniques',
          'Forms (Taegeuk Sa Jang)',
          'Multiple board breaking'
        ],
        minimumTrainingHours: 100,
        minimumAge: 9,
        testingFee: 1400,
        description: 'Advanced colored belt with complex techniques',
        status: 'Active',
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: 'BELT-005',
        name: 'Blue Belt',
        level: 5,
        color: '#0000FF',
        colorCode: '#0000FF',
        order: 5,
        category: 'Colored Belt',
        requirements: [
          'All previous belt requirements',
          'Advanced jump kicks',
          'Spinning techniques',
          'Competition sparring',
          'Forms (Taegeuk Oh Jang)',
          'Teaching assistance'
        ],
        minimumTrainingHours: 120,
        minimumAge: 10,
        testingFee: 1600,
        description: 'Pre-black belt level with leadership responsibilities',
        status: 'Active',
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: 'BELT-006',
        name: 'Red Belt',
        level: 6,
        color: '#DC143C',
        colorCode: '#DC143C',
        order: 6,
        category: 'Colored Belt',
        requirements: [
          'All previous belt requirements',
          'Master-level techniques',
          'Advanced spinning kicks',
          'Tournament competition',
          'Forms (Taegeuk Yuk Jang)',
          'Student mentoring'
        ],
        minimumTrainingHours: 150,
        minimumAge: 12,
        testingFee: 1800,
        description: 'Highest colored belt before black belt',
        status: 'Active',
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: 'BELT-007',
        name: '1st Dan Black Belt',
        level: 7,
        color: '#000000',
        colorCode: '#000000',
        order: 7,
        category: 'Black Belt',
        requirements: [
          'All colored belt requirements',
          'All Taegeuk forms (1-8)',
          'Advanced breaking techniques',
          'Teaching capability',
          'Leadership demonstration',
          'Physical and mental discipline'
        ],
        minimumTrainingHours: 200,
        minimumAge: 14,
        testingFee: 3000,
        description: 'First degree black belt - Beginning of mastery',
        status: 'Active',
        isActive: true,
        createdBy: 'ADMIN-001',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    // Apply filters if provided
    const { category, status, level } = req.query;
    let filteredData = sampleBeltLevelsData;
    
    if (category && category !== 'All Belts') {
      filteredData = filteredData.filter(belt => 
        belt.category === category
      );
    }
    
    if (status && status !== 'All Status') {
      filteredData = filteredData.filter(belt => 
        belt.status === status
      );
    }
    
    if (level) {
      filteredData = filteredData.filter(belt => 
        belt.level === parseInt(level)
      );
    }
    
    console.log(`✅ Returning ${filteredData.length} belt levels`);
    
    res.status(200).json({
      status: 'success',
      data: { 
        belts: filteredData,
        count: filteredData.length,
        query: req.query
      }
    });
  } catch (error) {
    console.error('❌ Error fetching public belt levels:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt levels',
      error: error.message
    });
  }
});

// All routes require authentication
router.use(protect);

// GET routes (authenticated users)
router.get('/', getBeltLevels);
router.get('/statistics', getBeltStatistics);
router.get('/:id', getBeltById);

// Admin only routes
router.post('/', adminOnly, createBelt);
router.put('/:id', adminOnly, updateBelt);
router.delete('/:id', adminOnly, deleteBelt);

module.exports = router;
