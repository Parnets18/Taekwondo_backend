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
const { uploadStudent } = require('../config/upload');

const router = express.Router();

// Test route (before auth)
router.get('/test', (req, res) => {
  console.log('📝 Students test route called');
  res.json({ status: 'success', message: 'Students routes working' });
});

// Test file upload route
router.post('/test-upload', uploadStudent.single('file'), (req, res) => {
  console.log('📎 Test upload - file:', req.file);
  if (req.file) {
    res.json({ status: 'success', file: req.file.filename, path: req.file.path });
  } else {
    res.json({ status: 'error', message: 'No file received' });
  }
});

// Debug route to check student by email (temporary - remove in production)
router.get('/debug/check-email/:email', async (req, res) => {
  try {
    const email = req.params.email;
    console.log('🔍 Checking for student with email:', email);
    
    const student = await Student.findOne({ email });
    
    if (student) {
      console.log('✅ Student found:', student._id, student.fullName);
      res.json({
        status: 'success',
        message: 'Student found',
        data: {
          id: student._id,
          fullName: student.fullName,
          email: student.email,
          hasPassword: !!student.password
        }
      });
    } else {
      console.log('❌ No student found with email:', email);
      res.status(404).json({
        status: 'error',
        message: 'No student found with this email'
      });
    }
  } catch (error) {
    console.error('❌ Error checking student:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
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
router.get('/certificate/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log(`📥 Student certificate download request: ${filename}`);

    // Local file path
    const filePath = path.join(__dirname, '..', 'uploads', 'students', filename);
    console.log(`📁 Checking local file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return res.status(404).json({
        status: 'error',
        message: 'Certificate file not found. Please ask the administrator to re-upload the certificate.',
        filename: filename
      });
    }

    console.log(`✅ Serving local file: ${filePath}`);
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Use inline for viewing in browser, attachment for forced download
    const forceDownload = req.query.download === '1';
    res.setHeader('Content-Disposition', `${forceDownload ? 'attachment' : 'inline'}; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    
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

// TEMPORARY: Public profile endpoint for debugging (REMOVE IN PRODUCTION)
router.get('/profile-debug/:email', async (req, res) => {
  try {
    const email = req.params.email;
    console.log('🔍 Debug: Looking for student with email:', email);
    
    const student = await Student.findOne({ email });
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found',
        email: email
      });
    }
    
    const studentData = student.toObject({ virtuals: true });
    delete studentData.password;
    
    if (!studentData.name && studentData.fullName) {
      studentData.name = studentData.fullName;
    }
    
    res.status(200).json({
      status: 'success',
      data: studentData,
      debug: {
        foundById: student._id,
        foundByEmail: email
      }
    });
  } catch (error) {
    console.error('❌ Debug profile error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get current student profile (authenticated student)
router.get('/profile', async (req, res) => {
  try {
    console.log('👤 Student profile request');
    console.log('🆔 User from token:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      fullName: req.user.fullName,
      name: req.user.name,
      modelName: req.user.constructor?.modelName
    });
    
    // Check if req.user is already a Student (from protect middleware)
    let student;
    
    // If the user object has fullName, it's likely already a Student
    if (req.user.fullName) {
      console.log('✅ User is already a Student object');
      student = req.user;
    } else {
      // Otherwise, try to find the student by ID
      console.log('🔍 Looking up student by ID:', req.user._id);
      student = await Student.findById(req.user._id);
      
      // If not found by ID, try to find by email
      if (!student && req.user.email) {
        console.log('🔍 Looking up student by email:', req.user.email);
        student = await Student.findOne({ email: req.user.email });
      }
    }
    
    if (!student) {
      console.log('❌ Student not found');
      console.log('🔍 User details:', JSON.stringify(req.user, null, 2));
      
      // List all students to help debug
      const allStudents = await Student.find().select('_id email fullName').limit(5);
      console.log('📋 Sample students in DB:', allStudents);
      
      return res.status(404).json({
        status: 'error',
        message: 'Student profile not found. Your account may not be set up as a student. Please contact administrator.',
        debug: {
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          userModel: req.user.constructor?.modelName,
          hint: 'The authenticated user ID does not match any student record'
        }
      });
    }
    
    console.log('✅ Student profile found:', student.fullName);
    
    // Convert to object and add virtual fields
    const studentData = student.toObject ? student.toObject({ virtuals: true }) : { ...student };
    
    // Remove password from response
    delete studentData.password;
    
    // Ensure name field is set (some screens expect 'name' instead of 'fullName')
    if (!studentData.name && studentData.fullName) {
      studentData.name = studentData.fullName;
    }
    
    res.status(200).json({
      status: 'success',
      data: studentData
    });
  } catch (error) {
    console.error('❌ Error fetching student profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update student profile photo (authenticated student)
router.put('/profile/photo', uploadStudent.single('photo'), async (req, res) => {
  try {
    console.log('📸 Updating profile photo for user:', req.user._id);
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No photo file provided'
      });
    }

    // Find student
    let student = await Student.findById(req.user._id);
    
    if (!student && req.user.email) {
      student = await Student.findOne({ email: req.user.email });
    }
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Update photo path
    student.photo = req.file.path;
    await student.save();

    console.log('✅ Profile photo updated:', req.file.path);

    res.status(200).json({
      status: 'success',
      message: 'Profile photo updated successfully',
      data: {
        photo: req.file.path
      }
    });
  } catch (error) {
    console.error('❌ Error updating profile photo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile photo',
      error: error.message
    });
  }
});

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
    { name: 'aadhar', maxCount: 1 },
    { name: 'birthCertificate', maxCount: 1 },
    // Achievement certificates
    { name: 'certificate_0_0', maxCount: 1 }, { name: 'certificate_0_1', maxCount: 1 }, { name: 'certificate_0_2', maxCount: 1 }, { name: 'certificate_0_3', maxCount: 1 }, { name: 'certificate_0_4', maxCount: 1 },
    { name: 'certificate_1_0', maxCount: 1 }, { name: 'certificate_1_1', maxCount: 1 }, { name: 'certificate_1_2', maxCount: 1 }, { name: 'certificate_1_3', maxCount: 1 }, { name: 'certificate_1_4', maxCount: 1 },
    { name: 'certificate_2_0', maxCount: 1 }, { name: 'certificate_2_1', maxCount: 1 }, { name: 'certificate_2_2', maxCount: 1 }, { name: 'certificate_2_3', maxCount: 1 }, { name: 'certificate_2_4', maxCount: 1 },
    // Belt exam certificates
    { name: 'examWhiteBeltCertFile', maxCount: 1 },
    { name: 'examWhiteYellowStripeCertFile', maxCount: 1 },
    { name: 'examYellowBeltCertFile', maxCount: 1 },
    { name: 'examYellowStripeCertFile', maxCount: 1 },
    { name: 'examGreenBeltCertFile', maxCount: 1 },
    { name: 'examGreenStripeCertFile', maxCount: 1 },
    { name: 'examBlueBeltCertFile', maxCount: 1 },
    { name: 'examBlueStripeCertFile', maxCount: 1 },
    { name: 'examRedBeltCertFile', maxCount: 1 },
    { name: 'examRedStripeCertFile', maxCount: 1 },
    { name: 'examBlackStripeCertFile', maxCount: 1 },
    { name: 'examBlackBeltCertFile', maxCount: 1 },
    { name: 'examBlack2DanCertFile', maxCount: 1 },
    { name: 'examBlack3DanCertFile', maxCount: 1 },
    { name: 'examBlack4DanCertFile', maxCount: 1 },
    { name: 'examBlack5DanCertFile', maxCount: 1 },
    { name: 'examBlack6DanCertFile', maxCount: 1 },
    { name: 'examBlack7DanCertFile', maxCount: 1 },
    { name: 'examBlack8DanCertFile', maxCount: 1 },
    { name: 'examBlack9DanCertFile', maxCount: 1 },
  ]), createStudent);

// Add logging middleware before update route
router.use('/:id', (req, res, next) => {
  if (req.method === 'PUT') {
    console.log('🔔 PUT request to /api/students/:id detected');
    console.log('   Student ID:', req.params.id);
    console.log('   Content-Type:', req.headers['content-type']);
    console.log('   Has files:', !!req.files);
  }
  next();
});

router.route('/:id')
  .get(getStudent)
  .put(staffOnly, (req, res, next) => {
    console.log('🔄 PUT /:id - Content-Type:', req.headers['content-type']);
    console.log('🔄 PUT /:id - Content-Length:', req.headers['content-length']);
    uploadStudent.any()(req, res, (err) => {
      if (err) {
        console.error('❌ Multer upload error:', err.message, err.code);
        return res.status(400).json({ status: 'error', message: `File upload error: ${err.message}` });
      }
      const files = Array.isArray(req.files) ? req.files : [];
      if (files.length > 0) {
        files.forEach(f => {
          const exists = require('fs').existsSync(f.path);
          console.log(`✅ File saved: ${f.fieldname} -> ${f.path} (exists: ${exists}, size: ${f.size}b)`);
        });
      } else {
        console.log('⚠️ No files in this request');
      }
      next();
    });
  }, updateStudent)
  .delete(staffOnly, deleteStudent);

// Download all student documents as PDF
router.get('/:id/download-documents', staffOnly, async (req, res) => {
  try {
    const { downloadStudentDocuments } = require('../controllers/studentController');
    await downloadStudentDocuments(req, res);
  } catch (error) {
    console.error('Error in download documents route:', error);
    res.status(500).json({ status: 'error', message: 'Failed to download documents' });
  }
});

module.exports = router;