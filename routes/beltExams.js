const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  submitBeltExam
} = require('../controllers/beltExamController');
const { validateBeltExam } = require('../middleware/validation');

console.log('🥋 Belt Exam routes loading...');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'belt-exams');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// @desc    Submit belt exam application
// @route   POST /api/belt-exams
// @access  Public
router.post('/', upload.single('photo'), validateBeltExam, submitBeltExam);

console.log('🥋 Belt Exam routes configured');

module.exports = router;
