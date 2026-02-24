const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getBlackBeltMembers,
  getBlackBeltMember,
  createBlackBeltMember,
  updateBlackBeltMember,
  deleteBlackBeltMember
} = require('../controllers/blackBeltController');
const { protect, authorize } = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'black-belt');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Public routes
router.get('/', getBlackBeltMembers);
router.get('/:id', getBlackBeltMember);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), upload.single('photo'), createBlackBeltMember);
router.put('/:id', protect, authorize('admin'), upload.single('photo'), updateBlackBeltMember);
router.delete('/:id', protect, authorize('admin'), deleteBlackBeltMember);

module.exports = router;
