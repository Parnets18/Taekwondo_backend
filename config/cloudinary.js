const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Using local multer storage
console.log('✅ Using local multer storage for file uploads');

// Helper to create local storage
const createStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '..', 'uploads', folder);
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`📁 Created directory: ${uploadDir}`);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      console.log(`📝 Saving file as: ${filename}`);
      cb(null, filename);
    }
  });
};

// Create upload middleware for different types
const uploadStudent = multer({ 
  storage: createStorage('students'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadBanner = multer({ 
  storage: createStorage('banners'),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadGallery = multer({ 
  storage: createStorage('gallery'),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadCertificate = multer({ 
  storage: createStorage('certificates'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadCommunity = multer({ 
  storage: createStorage('community'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadBlackBelt = multer({ 
  storage: createStorage('black-belt'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadAdmission = multer({ 
  storage: createStorage('admissions'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadBeltExam = multer({ 
  storage: createStorage('belt-exams'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { 
  uploadStudent,
  uploadBanner,
  uploadGallery,
  uploadCertificate,
  uploadCommunity,
  uploadBlackBelt,
  uploadAdmission,
  uploadBeltExam
};
