const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, staffOnly } = require('../middleware/auth');

// Test route (no auth required)
router.get('/test', (req, res) => {
  console.log('📝 Attendance test route called');
  res.json({ 
    status: 'success', 
    message: 'Attendance routes working',
    timestamp: new Date().toISOString()
  });
});

// Public route to get attendance data (for testing)
router.get('/public', attendanceController.getAttendancePublic);

// All routes below require authentication
router.use(protect);

// Get attendance records with filters
router.get('/', attendanceController.getAttendance); // Allow any authenticated user

// Get attendance statistics
router.get('/statistics', attendanceController.getAttendanceStatistics); // Allow any authenticated user

// Mark attendance for a student
router.post('/', staffOnly, attendanceController.markAttendance);

// Bulk mark attendance
router.post('/bulk', staffOnly, attendanceController.bulkMarkAttendance);

// Update attendance record
router.put('/:id', staffOnly, attendanceController.updateAttendance);

// Delete attendance record
router.delete('/:id', staffOnly, attendanceController.deleteAttendance);

module.exports = router;
