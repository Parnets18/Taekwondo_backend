const express = require('express');
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

// Test route (before auth)
router.get('/test', (req, res) => {
  console.log('📝 Students test route called');
  res.json({ status: 'success', message: 'Students routes working' });
});

// Public route to get students (no auth required for testing)
router.get('/public', async (req, res) => {
  try {
    console.log('👥 Public students route called');
    const students = await Student.find({ status: 'active' })
      .select('fullName email currentBelt studentId courseLevel enrollmentDate')
      .sort({ fullName: 1 })
      .limit(50);
    
    console.log(`✅ Found ${students.length} students`);
    
    res.status(200).json({
      status: 'success',
      data: { 
        students,
        count: students.length
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Student CRUD routes
router.route('/')
  .get(getStudents) // Allow any authenticated user to get students
  .post(staffOnly, createStudent);

router.route('/:id')
  .get(getStudent) // Allow any authenticated user to get student details
  .put(staffOnly, updateStudent)
  .delete(staffOnly, deleteStudent);

module.exports = router;