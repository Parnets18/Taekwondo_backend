const express = require('express');
const {
  submitAdmission,
  getAdmissionStatus,
  getAdmissionStats
} = require('../controllers/admissionController');
const { validateAdmission } = require('../middleware/validation');

const router = express.Router();

// @desc    Submit admission application
// @route   POST /api/admissions
// @access  Public
router.post('/', validateAdmission, submitAdmission);

// @desc    Get admission application status
// @route   GET /api/admissions/status/:email
// @access  Public
router.get('/status/:email', getAdmissionStatus);

// @desc    Get admission statistics (public)
// @route   GET /api/admissions/stats
// @access  Public
router.get('/stats', getAdmissionStats);

module.exports = router;