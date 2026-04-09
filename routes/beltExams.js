const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  submitBeltExam
} = require('../controllers/beltExamController');
const { validateBeltExam } = require('../middleware/validation');
const { uploadBeltExam } = require('../config/upload');

console.log('🥋 Belt Exam routes loading...');

const router = express.Router();

// @desc    Submit belt exam application
// @route   POST /api/belt-exams
// @access  Public
router.post('/', uploadBeltExam.single('photo'), validateBeltExam, submitBeltExam);

// @desc    Download belt exam certificate/photo
// @route   GET /api/belt-exams/download/:filename
// @access  Public
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log(`📥 Belt exam file download request: ${filename}`);

    // Local file path
    const filePath = path.join(__dirname, '..', 'uploads', 'belt-exams', filename);
    console.log(`📁 Checking local file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return res.status(404).json({
        status: 'error',
        message: 'File not found. Please ask the administrator to re-upload.',
        filename: filename
      });
    }

    console.log(`✅ Serving local file: ${filePath}`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading belt exam file:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error downloading file'
    });
  }
});

console.log('🥋 Belt Exam routes configured');

module.exports = router;
