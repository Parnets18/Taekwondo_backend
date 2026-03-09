const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL || 'cloudinary://643421246195385:CIQxcJWYCotF9BaCxvk5InZ_YJE@dab7min7n'
});

console.log('☁️ Using Cloudinary for file uploads');
console.log('☁️ Cloudinary config:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? '***' + cloudinary.config().api_key.slice(-4) : 'NOT SET'
});

// Test Cloudinary connection
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection successful:', result);
  })
  .catch(err => {
    console.error('❌ Cloudinary connection failed:', err.message);
    console.error('⚠️ Files will be stored locally and deleted on server restart!');
  });

// Helper to create Cloudinary storage
const createCloudinaryStorage = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `taekwondo/${folder}`,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp']
    }
  });
  
  console.log(`☁️ Created Cloudinary storage for: ${folder}`);
  return storage;
};

// Fallback: Helper to create local storage (for development)
const createLocalStorage = (folder) => {
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

// Use Cloudinary storage by default, fallback to local if CLOUDINARY_URL not set
const createStorage = (folder) => {
  if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
    console.log(`☁️ Using Cloudinary storage for: ${folder}`);
    return createCloudinaryStorage(folder);
  } else {
    console.log(`📁 Using local storage for: ${folder}`);
    return createLocalStorage(folder);
  }
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log('📎 File upload attempt:');
    console.log('  - Field name:', file.fieldname);
    console.log('  - Original name:', file.originalname);
    console.log('  - MIME type:', file.mimetype);
    console.log('  - Size:', file.size);
    
    // Accept images and PDFs
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype)) {
      console.log('✅ File type accepted');
      cb(null, true);
    } else {
      console.log('❌ File type rejected:', file.mimetype);
      cb(new Error(`Invalid file type. Only JPG, PNG, and PDF files are allowed. Received: ${file.mimetype}`), false);
    }
  }
});

module.exports = { 
  uploadStudent,
  uploadBanner,
  uploadGallery,
  uploadCertificate,
  uploadCommunity,
  uploadBlackBelt,
  uploadAdmission,
  uploadBeltExam,
  cloudinary // Export cloudinary instance for direct use
};
