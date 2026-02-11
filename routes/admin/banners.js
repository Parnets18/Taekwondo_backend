const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bannerController = require('../../controllers/bannerController');
const { protect, restrictTo } = require('../../middleware/auth');

// Configure multer for banner image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/banners/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Admin routes (protected)
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', bannerController.getAllBanners);
router.post('/', upload.single('image'), bannerController.createBanner);
router.put('/order', bannerController.updateBannerOrder);
router.get('/:id', bannerController.getBanner);
router.put('/:id', upload.single('image'), bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
