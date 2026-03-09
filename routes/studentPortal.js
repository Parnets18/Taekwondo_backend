const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Fee = require('../models/Fee');
const Belt = require('../models/Belt');
const Promotion = require('../models/Promotion');
const BeltTest = require('../models/BeltTest');

// Apply authentication to all routes
router.use(protect);

// Get student's attendance records
router.get('/attendance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get student ID from authenticated user
    const studentId = req.user._id;
    
    // Build query
    const query = { student: studentId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('student', 'fullName');
    
    res.status(200).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
});

// Get student's certificates
router.get('/certificates', async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Get student with achievements
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }
    
    // Return achievements as certificates
    const certificates = student.achievements || [];
    
    res.status(200).json({
      status: 'success',
      data: {
        certificates
      }
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
});

// Get student's events
router.get('/events', async (req, res) => {
  try {
    // Get all active events
    const events = await Event.find({ status: 'active' })
      .sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        events
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// Get student's fees
router.get('/fees', async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Get fees for this student
    const fees = await Fee.find({ student: studentId })
      .sort({ dueDate: -1 })
      .populate('student', 'fullName');
    
    res.status(200).json({
      status: 'success',
      data: {
        fees
      }
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch fees',
      error: error.message
    });
  }
});

// Get student's belt promotions
router.get('/promotions', async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Get student details first
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }
    
    // Get promotions for this student using studentId or studentName
    const promotions = await Promotion.find({ 
      $or: [
        { studentId: studentId },
        { studentName: student.fullName }
      ]
    })
      .sort({ promotionDate: -1 })
      .populate('studentId', 'fullName');
    
    res.status(200).json({
      status: 'success',
      data: {
        promotions
      }
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch promotions',
      error: error.message
    });
  }
});

// Get student's upcoming belt tests
router.get('/upcoming-tests', async (req, res) => {
  try {
    const studentId = req.user._id;
    
    console.log('📝 Getting upcoming tests for student:', studentId);
    
    // Get student details first
    const student = await Student.findById(studentId);
    
    if (!student) {
      console.log('❌ Student not found:', studentId);
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }
    
    console.log('👤 Student found:', student.fullName);
    
    // Get all scheduled tests for this student (including past ones)
    const upcomingTests = await BeltTest.find({ 
      $or: [
        { studentId: studentId },
        { studentName: student.fullName }
      ],
      status: 'scheduled'
    })
      .sort({ testDate: -1 })
      .populate('studentId', 'fullName');
    
    console.log('📊 Found', upcomingTests.length, 'tests for', student.fullName);
    
    res.status(200).json({
      status: 'success',
      data: {
        tests: upcomingTests
      }
    });
  } catch (error) {
    console.error('Error fetching upcoming tests:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch upcoming tests',
      error: error.message
    });
  }
});

// Download certificate
router.get('/certificates/:id/download', async (req, res) => {
  try {
    const studentId = req.user._id;
    const certificateId = req.params.id;
    
    // Get student
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }
    
    // Find certificate in achievements
    const certificate = student.achievements.find(a => a._id.toString() === certificateId);
    
    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Certificate not found'
      });
    }
    
    // If certificate has an image, send it
    if (certificate.certificateImage) {
      const path = require('path');
      const fs = require('fs');
      const filePath = path.join(__dirname, '..', certificate.certificateImage);
      
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.status(404).json({
          status: 'error',
          message: 'Certificate file not found'
        });
      }
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Certificate file not available'
      });
    }
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download certificate',
      error: error.message
    });
  }
});

module.exports = router;
