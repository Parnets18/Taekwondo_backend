const express = require('express');
const {
  getAllFounders,
  createFounder,
  updateFounder,
  deleteFounder,
  updateDescription
} = require('../controllers/founderController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/founders/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'founder-' + uniqueSuffix + path.extname(file.originalname));
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
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Public route
router.get('/', getAllFounders);

// Admin routes
router.post('/', protect, adminOnly, upload.single('photo'), createFounder);
router.put('/:id', protect, adminOnly, upload.single('photo'), updateFounder);
router.delete('/:id', protect, adminOnly, deleteFounder);
router.put('/description/update', protect, adminOnly, updateDescription);

module.exports = router;
