const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  submitBeltExam
} = require('../controllers/beltExamController');
const { validateBeltExam } = require('../middleware/validation');
const { uploadBeltExam } = require('../config/cloudinary');

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
    
    // Check if filename is actually a Cloudinary URL (encoded)
    if (filename.startsWith('http') || filename.includes('cloudinary')) {
      // Decode the URL
      const decodedUrl = decodeURIComponent(filename);
      console.log(`☁️ Redirecting to Cloudinary: ${decodedUrl}`);
      
      // Add fl_attachment flag to force download
      let downloadUrl = decodedUrl;
      if (downloadUrl.includes('cloudinary.com')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      
      return res.redirect(downloadUrl);
    }
    
    // Local file path
    const filePath = path.join(__dirname, '..', 'uploads', 'belt-exams', filename);
    
    console.log(`📁 Checking local file: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return res.status(404).json({
        status: 'error',
        message: 'File not found. This file was uploaded before Cloudinary integration and has been deleted. Please ask the administrator to re-upload.',
        filename: filename
      });
    }
    
    console.log(`✅ Serving local file: ${filePath}`);
    
    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Send file
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
