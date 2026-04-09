const express = require('express');
const router = express.Router();
const {
  getGalleryPhotos,
  getGalleryPhoto,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto
} = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadGallery } = require('../config/upload');

// Public routes
router.get('/', getGalleryPhotos);
router.get('/:id', getGalleryPhoto);

// Test upload endpoint (temporary - for debugging)
router.post('/test-upload', uploadGallery.single('photo'), (req, res) => {
  console.log('🧪 Test upload endpoint hit');
  console.log('📁 File received:', req.file);
  console.log('📋 Body:', req.body);
  
  if (req.file) {
    res.json({
      status: 'success',
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      }
    });
  } else {
    res.status(400).json({
      status: 'error',
      message: 'No file received'
    });
  }
});

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), uploadGallery.array('photos', 20), createGalleryPhoto);
router.put('/:id', protect, authorize('admin'), (req, res, next) => {
  // If multipart (file upload), use multer; otherwise pass through for JSON body
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    uploadGallery.single('photo')(req, res, next);
  } else {
    next();
  }
}, updateGalleryPhoto);
router.delete('/:id', protect, authorize('admin'), deleteGalleryPhoto);

module.exports = router;
