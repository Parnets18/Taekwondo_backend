const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getUpcomingBirthdays
} = require('../controllers/studentController');
const { protect, staffOnly, adminOnly } = require('../middleware/auth');
const Student = require('../models/Student');
const { uploadStudent } = require('../config/cloudinary');

const router = express.Router();

// Test route (before auth)
router.get('/test', (req, res) => {
  console.log('📝 Students test route called');
  res.json({ status: 'success', message: 'Students routes working' });
});

// Public route to get upcoming birthdays (no auth required)
router.get('/birthdays', getUpcomingBirthdays);

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
      .select('fullName photo dateOfBirth gender instructorName joiningDate currentBeltLevel achievements idNumber admissionNumber')
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
        currentBeltLevel: studentObj.currentBeltLevel,
        achievements: studentObj.achievements || [],
        idNumber: studentObj.idNumber,
        admissionNumber: studentObj.admissionNumber
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

// Download certificate endpoint (public - no auth required)
router.get('/certificate/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'students', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate file not found'
      });
    }
    
    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error downloading certificate'
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
  .get(getStudents)
  .post(staffOnly, uploadStudent.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'certificate_0_0', maxCount: 1 },
    { name: 'certificate_0_1', maxCount: 1 },
    { name: 'certificate_0_2', maxCount: 1 },
    { name: 'certificate_0_3', maxCount: 1 },
    { name: 'certificate_0_4', maxCount: 1 },
    { name: 'certificate_1_0', maxCount: 1 },
    { name: 'certificate_1_1', maxCount: 1 },
    { name: 'certificate_1_2', maxCount: 1 },
    { name: 'certificate_1_3', maxCount: 1 },
    { name: 'certificate_1_4', maxCount: 1 },
    { name: 'certificate_2_0', maxCount: 1 },
    { name: 'certificate_2_1', maxCount: 1 },
    { name: 'certificate_2_2', maxCount: 1 },
    { name: 'certificate_2_3', maxCount: 1 },
    { name: 'certificate_2_4', maxCount: 1 }
  ]), createStudent);

router.route('/:id')
  .get(getStudent)
  .put(staffOnly, uploadStudent.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'certificate_0_0', maxCount: 1 },
    { name: 'certificate_0_1', maxCount: 1 },
    { name: 'certificate_0_2', maxCount: 1 },
    { name: 'certificate_0_3', maxCount: 1 },
    { name: 'certificate_0_4', maxCount: 1 },
    { name: 'certificate_1_0', maxCount: 1 },
    { name: 'certificate_1_1', maxCount: 1 },
    { name: 'certificate_1_2', maxCount: 1 },
    { name: 'certificate_1_3', maxCount: 1 },
    { name: 'certificate_1_4', maxCount: 1 },
    { name: 'certificate_2_0', maxCount: 1 },
    { name: 'certificate_2_1', maxCount: 1 },
    { name: 'certificate_2_2', maxCount: 1 },
    { name: 'certificate_2_3', maxCount: 1 },
    { name: 'certificate_2_4', maxCount: 1 }
  ]), updateStudent)
  .delete(staffOnly, deleteStudent);

module.exports = router;