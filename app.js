const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const admissionRoutes = require('./routes/admissions');
const adminAdmissionRoutes = require('./routes/admin/admissions');
const beltExamRoutes = require('./routes/beltExams');
const adminBeltExamRoutes = require('./routes/admin/beltExams');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const certificateRoutes = require('./routes/certificates');
const achievementRoutes = require('./routes/achievements');
const badgeRoutes = require('./routes/badges');
const certificateTemplateRoutes = require('./routes/certificate-templates');
const feeRoutes = require('./routes/fees');
const beltRoutes = require('./routes/belt');
const eventRoutes = require('./routes/events');
const participantRoutes = require('./routes/participants');
const attendanceRoutes = require('./routes/attendance');
const loginRoutes = require('./routes/login');
const bannerRoutes = require('./routes/banners');
const adminBannerRoutes = require('./routes/admin/banners');
const galleryRoutes = require('./routes/gallery');
const communityRoutes = require('./routes/community');
const blackBeltRoutes = require('./routes/blackBelt');
const aboutSectionRoutes = require('./routes/aboutSection');
const aboutDojangStoryRoutes = require('./routes/aboutDojangStory');
const mentorRoutes = require('./routes/mentors');
const leadershipRoutes = require('./routes/leadership');
const certificateVerificationRoutes = require('./routes/certificateVerification');
const founderRoutes = require('./routes/founders');
const studentPortalRoutes = require('./routes/studentPortal');
// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { createDefaultAdmin } = require('./utils/createAdmin');

const app = express();

// CORS must be the FIRST middleware - before any routes or other middleware
// app.use(cors({
//   origin: function(origin, callback) {
//     // Allow requests with no origin (mobile apps, Postman, etc.)
//     if (!origin) return callback(null, true);
    
//     // Allow all origins for now
//     return callback(null, true);
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//   exposedHeaders: ['Content-Range', 'X-Content-Range'],
//   maxAge: 86400 // 24 hours
// }));

// Add CORS headers manually as backup
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
//   res.header('Access-Control-Allow-Credentials', 'true');
  
//   // Handle preflight
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }
//   next();
// });
// app.use(cors({
//   origin: [
//     'http://localhost:5176',
//     'http://localhost:5000',
//   'https://taekwon.netlify.app'
//   ],
//   credentials: true
// })); 
app.use(cors({
  origin: '*'
}));

// Simple test route right after app creation
app.get('/api/simple-test', (req, res) => {
  res.json({ status: 'success', message: 'Simple test route working' });
});

// Security middleware - Configure helmet to allow images
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`   Headers:`, req.headers.authorization ? 'Has Auth Token' : 'No Auth Token');
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to handle Cloudinary public_ids in /uploads requests
app.use('/uploads', (req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(`   Headers: ${req.headers.authorization ? 'Has Auth Token' : 'No Auth Token'}`);
  
  // Extract filename from URL (e.g., /uploads/students/xyz.png -> xyz.png)
  const urlParts = req.path.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  console.log(`   Filename: ${filename}`);
  
  // Check if it's a Cloudinary public_id (short random string without timestamp pattern)
  const hasLocalTimestampPattern = /^[a-z_\-]+\-\d{13}\-\d+\./i.test(filename);
  const looksLikeCloudinaryId = filename && 
                                 !hasLocalTimestampPattern && 
                                 !filename.includes('\\') && 
                                 filename.length < 50 && 
                                 filename.length > 10; // Cloudinary IDs are typically 20-30 chars
  
  console.log(`   Local timestamp pattern: ${hasLocalTimestampPattern}`);
  console.log(`   Looks like Cloudinary ID: ${looksLikeCloudinaryId}`);
  
  if (looksLikeCloudinaryId) {
    // Construct Cloudinary URL
    // req.path is like /students/xyz.png, so we need to extract the folder
    const folder = urlParts[urlParts.length - 2]; // e.g., 'students'
    const cloudinaryUrl = `https://res.cloudinary.com/dab7min7n/image/upload/taekwondo/${folder}/${filename}`;
    console.log(`☁️ Detected Cloudinary public_id in static request, redirecting to: ${cloudinaryUrl}`);
    return res.redirect(cloudinaryUrl);
  }
  
  // Not a Cloudinary ID, continue to static file serving
  console.log(`   Continuing to static file serving...`);
  next();
});

// Static files - serve uploads directory with CORS headers and 404 handling
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
}, express.static(path.join(__dirname, 'uploads')), (req, res) => {
  // Custom 404 handler for missing upload files
  console.log(`❌ File not found: ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: 'File not found. This file was uploaded before Cloudinary integration and has been deleted on server restart. Please re-upload the file through the admin panel to ensure permanent storage.',
    path: req.originalUrl,
    solution: 'Re-upload this file through the admin panel. New uploads will be stored on Cloudinary and never deleted.'
  });
});
console.log('📁 Static files served from:', path.join(__dirname, 'uploads'));

// Database connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      
      // Drop email unique indexes to allow duplicate emails
      const dropEmailIndexes = require('./utils/dropEmailIndexes');
      await dropEmailIndexes();
      
      // Create default admin
      createDefaultAdmin();
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      process.exit(1);
    });
} else {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

// Contact routes are handled by the contact router below

// Test belt levels endpoint (no auth required)
app.get('/api/test-belt-levels', async (req, res) => {
  try {
    const Belt = require('./models/Belt');
    console.log('🧪 Test belt levels endpoint called');
    
    const belts = await Belt.find({ isActive: true }).sort({ level: 1 });
    console.log(`Found ${belts.length} belts in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${belts.length} belts`,
      data: { belts }
    });
  } catch (error) {
    console.error('Test belt levels error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Test failed',
      error: error.message
    });
  }
});

// Test belt creation endpoint
app.get('/api/test-belt-creation', async (req, res) => {
  try {
    const Belt = require('./models/Belt');
    
    console.log('Testing belt creation...');
    
    const testBeltData = {
      name: 'Test White Belt',
      level: 99,
      color: 'white',
      hex: '#FFFFFF',
      requirements: ['Test requirement 1', 'Test requirement 2'],
      students: 0
    };
    
    console.log('Creating belt with data:', testBeltData);
    
    const belt = new Belt(testBeltData);
    await belt.save();
    
    console.log('Belt created successfully:', belt._id);
    
    // Fetch it back
    const savedBelt = await Belt.findById(belt._id);
    
    res.json({ 
      status: 'success', 
      message: 'Belt created successfully',
      beltId: belt._id,
      data: savedBelt
    });
  } catch (error) {
    console.error('Test belt creation error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Test belt creation failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test students controller directly
app.get('/api/students-test', async (req, res) => {
  console.log('🧪 Direct students test called');
  res.json({ 
    status: 'success', 
    message: 'Direct test working',
    env: process.env.MONGODB_URI 
  });
});

// Test fee creation endpoint
app.get('/api/test-fee-creation', async (req, res) => {
  try {
    const Fee = require('./models/Fee');
    
    console.log('Testing fee creation...');
    
    const testFeeData = {
      studentName: 'Test Student Direct',
      course: 'Beginner',
      feeType: 'Monthly Fee',
      amount: 2000,
      dueDate: new Date('2025-02-15')
    };
    
    console.log('Creating fee with data:', testFeeData);
    
    const fee = new Fee(testFeeData);
    await fee.save();
    
    console.log('Fee created successfully:', fee._id);
    
    res.json({ 
      status: 'success', 
      message: 'Fee created successfully',
      feeId: fee._id,
      data: fee
    });
  } catch (error) {
    console.error('Test fee creation error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Test fee creation failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test fee creation endpoint (temporary)
app.get('/api/test-direct-fee', async (req, res) => {
  try {
    console.log('Direct fee test endpoint hit');
    const Fee = require('./models/Fee');
    
    const testFeeData = {
      studentName: 'Test Student API',
      course: 'Beginner',
      feeType: 'Monthly Fee',
      amount: 1500,
      dueDate: new Date('2025-02-20')
    };
    
    console.log('Creating fee with data:', testFeeData);
    
    const fee = new Fee(testFeeData);
    await fee.save();
    
    console.log('Fee created successfully:', fee._id);
    
    res.json({ 
      status: 'success', 
      message: 'Direct fee created successfully',
      feeId: fee._id,
      data: fee
    });
  } catch (error) {
    console.error('Direct fee creation error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Direct fee creation failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test endpoint
app.get('/api/test-simple', (req, res) => {
  console.log('Simple test endpoint hit');
  res.json({ status: 'success', message: 'Simple test working' });
});

// ============================================================================
// DIRECT PUBLIC CERTIFICATE VERIFY ENDPOINT - NO AUTH - PLACED BEFORE ALL ROUTES
// ============================================================================
app.post('/api/certificates/verify', async (req, res) => {
  try {
    console.log('🔍🔍🔍 DIRECT CERTIFICATE VERIFY ENDPOINT HIT (server.js) - NO AUTH 🔍🔍🔍');
    const Certificate = require('./models/Certificate');
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification code is required'
      });
    }

    console.log('🔍 Verifying certificate with code:', verificationCode);

    // Query the database for the certificate
    const certificate = await Certificate.findOne({ 
      verificationCode: verificationCode.toUpperCase() 
    }).populate('studentId', 'name');

    if (!certificate) {
      console.log('❌ Certificate not found:', verificationCode);
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found or invalid verification code'
      });
    }

    console.log('✅ Certificate verified successfully:', certificate.verificationCode);

    // Format response to match frontend expectations
    const responseData = {
      isValid: true,
      certificate: {
        id: certificate.id || certificate._id.toString(),
        studentName: certificate.studentName,
        achievementType: certificate.achievementType,
        achievementDetails: {
          title: certificate.achievementDetails?.title || certificate.achievementType,
          description: certificate.achievementDetails?.description || '',
          level: certificate.achievementDetails?.level || '',
          grade: certificate.achievementDetails?.grade || '',
          examiner: certificate.achievementDetails?.examiner || certificate.metadata?.instructorName || 'Academy Director'
        },
        issuedDate: certificate.issuedDate,
        verificationCode: certificate.verificationCode,
        status: certificate.status,
        hasFile: !!certificate.filePath
      }
    };

    res.json({
      status: 'success',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Certificate verification failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Verification service temporarily unavailable'
    });
  }
});

// ============================================================================
// DIRECT PUBLIC FEES ENDPOINT - ABSOLUTELY NO AUTH - PLACED BEFORE ALL ROUTES
// ============================================================================
app.get('/api/fees/public', async (req, res) => {
  try {
    console.log('💰💰💰 DIRECT PUBLIC FEES ENDPOINT HIT (server.js) - NO AUTH 💰💰💰');
    const Fee = require('./models/Fee');
    
    const fees = await Fee.find({}).sort({ createdAt: -1 }).limit(100);
    console.log(`📦 Found ${fees.length} fees in database`);
    
    const transformedData = fees.map(fee => {
      const feeObj = fee.toObject();
      return {
        ...feeObj,
        paidAmount: feeObj.totalPaidAmount || 0,
        pendingAmount: Math.max(0, (feeObj.amount || 0) - (feeObj.totalPaidAmount || 0))
      };
    });
    
    res.status(200).json({
      status: 'success',
      success: true,
      data: transformedData,
      count: transformedData.length,
      source: 'database',
      message: 'Public fees fetched from server.js - NO AUTH'
    });
  } catch (error) {
    console.error('❌ Error in direct public fees endpoint:', error);
    res.status(500).json({
      status: 'error',
      success: false,
      message: 'Failed to fetch public fees',
      error: error.message
    });
  }
});

// Routes
console.log('🔐 Loading auth routes...');
try {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading auth routes:', error);
}
app.use('/api/admissions', admissionRoutes);
app.use('/api/admin/admissions', adminAdmissionRoutes);
app.use('/api/belt-exams', beltExamRoutes);
app.use('/api/admin/belt-exams', adminBeltExamRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/certificate-templates', certificateTemplateRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/belts', beltRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/admin/banners', adminBannerRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/black-belt', blackBeltRoutes);
app.use('/api/about-section', aboutSectionRoutes);
app.use('/api/about-dojang-story', aboutDojangStoryRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/leadership', leadershipRoutes);
app.use('/api/locations', require('./routes/location'));
app.use('/api/students', studentRoutes);
app.use('/api/certificate-verification', certificateVerificationRoutes);
app.use('/api/founders', founderRoutes);
app.use('/api/student-portal', studentPortalRoutes);
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/techniques', require('./routes/techniques'));



// Health check endpoint - Support both GET and POST
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Combat Warrior Institute API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.post('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Combat Warrior Institute API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Public students endpoint (no auth required)
app.post('/api/students/public', async (req, res) => {
  try {
    const Student = require('./models/Student');
    console.log('🧪 Public students endpoint called (POST)');
    
    const students = await Student.find({ isActive: true }).limit(10);
    console.log(`Found ${students.length} students in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${students.length} students`,
      data: { 
        students
      }
    });
  } catch (error) {
    console.error('Public students error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public students failed',
      error: error.message
    });
  }
});

// Public certificates endpoint (no auth required)
app.post('/api/certificates/public', async (req, res) => {
  try {
    const Certificate = require('./models/Certificate');
    console.log('🧪 Public certificates endpoint called (POST)');
    
    const certificates = await Certificate.find({ status: 'Issued' }).limit(20);
    console.log(`Found ${certificates.length} certificates in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${certificates.length} certificates`,
      data: { 
        certificates
      }
    });
  } catch (error) {
    console.error('Public certificates error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public certificates failed',
      error: error.message
    });
  }
});

// Public attendance endpoint (no auth required)
app.post('/api/attendance/public', async (req, res) => {
  try {
    const Attendance = require('./models/Attendance');
    console.log('🧪 Public attendance endpoint called (POST)');
    
    const attendance = await Attendance.find({}).sort({ date: -1 }).limit(50);
    console.log(`Found ${attendance.length} attendance records in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${attendance.length} attendance records`,
      data: { 
        attendance
      }
    });
  } catch (error) {
    console.error('Public attendance error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public attendance failed',
      error: error.message
    });
  }
});

// Public belt levels endpoint (no auth required) - Support both GET and POST
app.get('/api/belts-public', async (req, res) => {
  try {
    const Belt = require('./models/Belt');
    console.log('🧪 Public belt levels endpoint called (GET)');
    
    const belts = await Belt.find({ isActive: true }).sort({ level: 1 });
    console.log(`Found ${belts.length} belt levels in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${belts.length} belt levels`,
      data: { 
        belts
      }
    });
  } catch (error) {
    console.error('Public belt levels error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public belt levels failed',
      error: error.message
    });
  }
});

app.post('/api/belts-public', async (req, res) => {
  try {
    const Belt = require('./models/Belt');
    console.log('🧪 Public belt levels endpoint called (POST)');
    
    const belts = await Belt.find({ isActive: true }).sort({ level: 1 });
    console.log(`Found ${belts.length} belt levels in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${belts.length} belt levels`,
      data: { 
        belts
      }
    });
  } catch (error) {
    console.error('Public belt levels error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public belt levels failed',
      error: error.message
    });
  }
});

// Public promotions endpoint (no auth required) - Support both GET and POST
app.get('/api/promotions-public', async (req, res) => {
  try {
    const Promotion = require('./models/Promotion');
    console.log('🧪 Public promotions endpoint called (GET)');
    
    const promotions = await Promotion.find({}).sort({ promotionDate: -1 }).limit(50);
    console.log(`Found ${promotions.length} promotions in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${promotions.length} promotions`,
      data: { 
        promotions
      }
    });
  } catch (error) {
    console.error('Public promotions error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public promotions failed',
      error: error.message
    });
  }
});

app.post('/api/promotions-public', async (req, res) => {
  try {
    const Promotion = require('./models/Promotion');
    console.log('🧪 Public promotions endpoint called (POST)');
    
    const promotions = await Promotion.find({}).sort({ promotionDate: -1 }).limit(50);
    console.log(`Found ${promotions.length} promotions in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${promotions.length} promotions`,
      data: { 
        promotions
      }
    });
  } catch (error) {
    console.error('Public promotions error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public promotions failed',
      error: error.message
    });
  }
});

// Public belt tests endpoint (no auth required) - Support both GET and POST
app.get('/api/belt-tests-public', async (req, res) => {
  try {
    const BeltTest = require('./models/BeltTest');
    console.log('🧪 Public belt tests endpoint called (GET)');
    
    // Get all scheduled tests (including past ones for demo purposes)
    const upcomingTests = await BeltTest.find({ 
      status: 'scheduled'
    }).sort({ testDate: -1 }).limit(50);
    
    console.log(`Found ${upcomingTests.length} belt tests in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${upcomingTests.length} belt tests`,
      data: { 
        tests: upcomingTests
      }
    });
  } catch (error) {
    console.error('Public belt tests error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public belt tests failed',
      error: error.message
    });
  }
});

app.post('/api/belt-tests-public', async (req, res) => {
  try {
    const BeltTest = require('./models/BeltTest');
    console.log('🧪 Public belt tests endpoint called (POST)');
    
    // Get all scheduled tests (including past ones for demo purposes)
    const upcomingTests = await BeltTest.find({ 
      status: 'scheduled'
    }).sort({ testDate: -1 }).limit(50);
    
    console.log(`Found ${upcomingTests.length} belt tests in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${upcomingTests.length} belt tests`,
      data: { 
        tests: upcomingTests
      }
    });
  } catch (error) {
    console.error('Public belt tests error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public belt tests failed',
      error: error.message
    });
  }
});

// Public events endpoint (no auth required) - Support both GET and POST
app.get('/api/events-public', async (req, res) => {
  try {
    const Event = require('./models/Event');
    console.log('🧪 Public events endpoint called (GET)');
    
    const { year, month, status } = req.query;
    let query = { isActive: true };
    
    // Date filtering
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      
      if (month && month !== 'All Months') {
        const monthIndex = new Date(Date.parse(month + " 1, 2000")).getMonth();
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        query.date = { $gte: startOfMonth, $lte: endOfMonth };
      } else {
        query.date = { $gte: startOfYear, $lte: endOfYear };
      }
    }
    
    // Status filtering
    if (status && status !== 'All Events') {
      if (status === 'Upcoming') {
        query.date = { ...query.date, $gte: new Date() };
      } else if (status === 'Past') {
        query.date = { ...query.date, $lt: new Date() };
      }
    }
    
    console.log('🔍 Events Query:', query);
    
    const events = await Event.find(query).sort({ date: -1 }).limit(50);
    console.log(`Found ${events.length} events in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${events.length} events`,
      data: { 
        events,
        count: events.length,
        query: query
      }
    });
  } catch (error) {
    console.error('Public events error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public events failed',
      error: error.message
    });
  }
});

app.post('/api/events-public', async (req, res) => {
  try {
    const Event = require('./models/Event');
    console.log('🧪 Public events endpoint called (POST)');
    
    const { year, month, status } = req.body;
    let query = { isActive: true };
    
    // Date filtering
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      
      if (month && month !== 'All Months') {
        const monthIndex = new Date(Date.parse(month + " 1, 2000")).getMonth();
        const startOfMonth = new Date(year, monthIndex, 1);
        const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        query.date = { $gte: startOfMonth, $lte: endOfMonth };
      } else {
        query.date = { $gte: startOfYear, $lte: endOfYear };
      }
    }
    
    // Status filtering
    if (status && status !== 'All Events') {
      if (status === 'Upcoming') {
        query.date = { ...query.date, $gte: new Date() };
      } else if (status === 'Past') {
        query.date = { ...query.date, $lt: new Date() };
      }
    }
    
    console.log('🔍 Events Query:', query);
    
    const events = await Event.find(query).sort({ date: -1 }).limit(50);
    console.log(`Found ${events.length} events in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${events.length} events`,
      data: { 
        events,
        count: events.length,
        query: query
      }
    });
  } catch (error) {
    console.error('Public events error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Public events failed',
      error: error.message
    });
  }
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const Course = require('./models/Course');
    
    // Try to create a very simple course
    const testCourse = new Course({
      name: 'DB Test Course',
      level: 'beginner',
      description: 'Testing database connection',
      duration: {
        months: 12,
        sessionsPerWeek: 3,
        sessionDuration: 45
      },
      fees: {
        registrationFee: 500,
        monthlyFee: 2500,
        examFee: 200
      },
      curriculum: [{
        week: 1,
        topic: 'Test Topic',
        objectives: ['Test objective'],
        techniques: []
      }],
      ageGroup: {
        min: 5,
        max: 12
      },
      maxStudents: 20,
      schedule: [{
        day: 'monday',
        startTime: '18:00',
        endTime: '19:00'
      }]
    });

    const savedCourse = await testCourse.save();
    
    // Count courses
    const courseCount = await Course.countDocuments();
    
    res.json({ 
      status: 'success', 
      message: 'Database test successful',
      courseId: savedCourse._id,
      totalCourses: courseCount
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test events endpoint directly in server.js (no auth required)
app.get('/api/events-direct-test', async (req, res) => {
  try {
    const Event = require('./models/Event');
    console.log('🧪 Direct events test called');
    
    const events = await Event.find({ isActive: true }).limit(5);
    console.log(`Found ${events.length} events in database`);
    
    res.json({ 
      status: 'success', 
      message: `Found ${events.length} events`,
      data: { events }
    });
  } catch (error) {
    console.error('Direct events test error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Direct events test failed',
      error: error.message
    });
  }
});

// Test contact endpoint directly in server.js
app.get('/api/contact/direct-test', (req, res) => {
  res.json({ status: 'success', message: 'Direct contact route working' });
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Local API URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Network API URL: http://192.168.1.48:${PORT}/api`);
});