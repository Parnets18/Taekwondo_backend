const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const admissionRoutes = require('./routes/admissions');
const adminAdmissionRoutes = require('./routes/admin/admissions');
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

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { createDefaultAdmin } = require('./utils/createAdmin');

const app = express();

// Simple test route right after app creation
app.get('/api/simple-test', (req, res) => {
  res.json({ status: 'success', message: 'Simple test route working' });
});

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

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

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/admin/admissions', adminAdmissionRoutes);
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
app.use('/api/events', participantRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Combat Warrior Institute API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});