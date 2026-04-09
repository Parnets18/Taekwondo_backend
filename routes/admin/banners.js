const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/bannerController');
const { protect, restrictTo } = require('../../middleware/auth');
const { uploadBanner } = require('../../config/upload');

// Admin routes (protected)
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', bannerController.getAllBanners);
router.post('/', uploadBanner.single('image'), bannerController.createBanner);
router.put('/order', bannerController.updateBannerOrder);
router.get('/:id', bannerController.getBanner);
router.put('/:id', uploadBanner.single('image'), bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
