const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

// Public routes
router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBanner);

module.exports = router;
