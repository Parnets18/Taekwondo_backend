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

// All routes require authentication
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
