const express = require('express');
const router = express.Router();

console.log('📝 Belt Tests routes loading...');

const {
  getBeltTests,
  getBeltTestById,
  createBeltTest,
  updateBeltTest,
  deleteBeltTest,
  getBeltTestStatistics
} = require('../../controllers/belt/beltTestController');

const { protect, adminOnly } = require('../../middleware/auth');

console.log('📝 Belt Tests routes configured');

// All routes require authentication
router.use(protect);

// GET routes (authenticated users)
router.get('/', getBeltTests);
router.get('/statistics', getBeltTestStatistics);
router.get('/:id', getBeltTestById);

// Admin only routes
router.post('/', adminOnly, createBeltTest);
router.put('/:id', adminOnly, updateBeltTest);
router.delete('/:id', adminOnly, deleteBeltTest);

module.exports = router;
