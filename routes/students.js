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
  .get(staffOnly, getStudents)
  .post(staffOnly, createStudent);

router.route('/:id')
  .get(staffOnly, getStudent)
  .put(staffOnly, updateStudent)
  .delete(staffOnly, deleteStudent);

module.exports = router;