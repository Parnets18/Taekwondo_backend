const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('📁 Using Multer for local file uploads');

// Helper to create local storage with Multer
const createLocalStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '..', 'uploads', folder);
      console.log(`📁 Multer destination: ${uploadDir}`);
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
          console.log(`📁 Created directory: ${uploadDir}`);
        }
        // Verify directory is writable
        fs.accessSync(uploadDir, fs.constants.W_OK);
        cb(null, uploadDir);
      } catch (err) {
        console.error(`❌ Multer destination error for ${uploadDir}:`, err.message);
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      console.log(`📝 Saving file as: ${filename} (size: ${file.size || 'unknown'})`);
      cb(null, filename);
    }
  });
};

// Use Multer local storage for all uploads
const createStorage = (folder) => {
  console.log(`📁 Using Multer local storage for: ${folder}`);
  return createLocalStorage(folder);
};

// Create upload middleware for different types
const uploadStudent = multer({ 
  storage: createStorage('students'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
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

const uploadOnboarding = multer({
  storage: createStorage('onboarding'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadTechnique = multer({
  storage: createStorage('techniques'),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only images and videos are allowed. Received: ${file.mimetype}`), false);
    }
  }
});

const uploadBeltExam = multer({ 
  storage: createStorage('belt-exams'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only JPG, PNG, and PDF files are allowed. Received: ${file.mimetype}`), false);
    }
  }
});

const uploadStance = multer({
  storage: createStorage('stances'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadSparring = multer({
  storage: createStorage('sparring'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { 
  uploadStudent,
  uploadStance,
  uploadBanner,
  uploadGallery,
  uploadCertificate,
  uploadCommunity,
  uploadBlackBelt,
  uploadAdmission,
  uploadOnboarding,
  uploadTechnique,
  uploadBeltExam,
  uploadTheory: multer({ storage: createStorage('theory'), limits: { fileSize: 10 * 1024 * 1024 } }),
  uploadBodyPart: multer({ storage: createStorage('body-parts'), limits: { fileSize: 10 * 1024 * 1024 } }),
  uploadMoralCulture: multer({ storage: createStorage('moral-culture'), limits: { fileSize: 10 * 1024 * 1024 } }),
  uploadPracticeSuit: multer({ 
    storage: createStorage('practice-suit'), 
    limits: { 
      fileSize: 10 * 1024 * 1024,
      files: 20,
      fields: 50,
      fieldSize: 2 * 1024 * 1024
    } 
  }),
  uploadDoJang: multer({ storage: createStorage('do-jang'), limits: { fileSize: 10 * 1024 * 1024 } }),
  uploadSparring,
};
