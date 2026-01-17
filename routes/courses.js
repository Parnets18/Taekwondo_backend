const express = require('express');
const { protect, staffOnly } = require('../middleware/auth');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents
} = require('../controllers/courseController');

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes (Admin/Staff only)
router.use(protect);
router.use(staffOnly);

router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.get('/:id/students', getCourseStudents);

module.exports = router;