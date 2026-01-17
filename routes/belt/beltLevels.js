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
