const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create storage for mentor photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'about', 'mentors');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`📁 Created directory: ${uploadDir}`);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'mentor-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`📝 Saving file as: ${filename}`);
    cb(null, filename);
  }
});

const uploadMentor = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = { uploadMentor };
