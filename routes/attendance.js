const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get attendance records with filters
router.get('/', attendanceController.getAttendance);

// Get attendance statistics
router.get('/statistics', attendanceController.getAttendanceStatistics);

// Mark attendance for a student
router.post('/', attendanceController.markAttendance);

// Bulk mark attendance
router.post('/bulk', attendanceController.bulkMarkAttendance);

// Update attendance record
router.put('/:id', attendanceController.updateAttendance);

// Delete attendance record
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;
