const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, staffOnly, adminOnly } = require('../middleware/auth');
const Student = require('../models/Student');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'students');
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

// Test route (before auth)
router.get('/test', (req, res) => {
  console.log('📝 Students test route called');
  res.json({ status: 'success', message: 'Students routes working' });
});

// Public route to get students (no auth required)
router.get('/public', async (req, res) => {
  try {
    console.log('👥 Public students route called');
    console.log('📊 Checking database connection...');
    
    const mongoose = require('mongoose');
    console.log('🔌 MongoDB connection state:', mongoose.connection.readyState);
    console.log('📦 Database name:', mongoose.connection.name);
    
    // Count total students first
    const totalCount = await Student.countDocuments();
    console.log('📈 Total students in database:', totalCount);
    
    const students = await Student.find()
      .select('fullName photo dateOfBirth gender instructorName joiningDate currentBeltLevel')
      .sort({ fullName: 1 });
    
    console.log(`✅ Found ${students.length} students`);
    if (students.length > 0) {
      console.log('📝 First student:', students[0]);
    }
    
    // Map students to include age calculation
    const studentsWithAge = students.map(student => {
      const studentObj = student.toObject({ virtuals: true });
      return {
        _id: studentObj._id,
        fullName: studentObj.fullName,
        photo: studentObj.photo,
        age: studentObj.age,
        gender: studentObj.gender,
        instructorName: studentObj.instructorName,
        joiningDate: studentObj.joiningDate,
        currentBeltLevel: studentObj.currentBeltLevel
      };
    });
    
    console.log(`✅ Returning ${studentsWithAge.length} students with age`);
    
    res.status(200).json({
      status: 'success',
      data: { 
        students: studentsWithAge,
        count: studentsWithAge.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching public students:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

// Apply authentication to all routes below this point
router.use(protect);

// Delete all students (admin only)
router.delete('/admin/delete-all', adminOnly, async (req, res) => {
  try {
    const result = await Student.deleteMany({});
    
    res.status(200).json({
      status: 'success',
      message: `Successfully deleted ${result.deletedCount} student records`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting all students:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting all students',
      error: process.env.NODE_ENV === 'production' ? error.message : undefined
    });
  }
});

// Student CRUD routes
router.route('/')
  .get(getStudents) // Allow any authenticated user to get students
  .post(staffOnly, upload.single('photo'), createStudent);

router.route('/:id')
  .get(getStudent) // Allow any authenticated user to get student details
  .put(staffOnly, upload.single('photo'), updateStudent)
  .delete(staffOnly, deleteStudent);

module.exports = router;