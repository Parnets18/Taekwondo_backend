const express = require('express');
const {
  getAllAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  deleteAdmission
} = require('../../controllers/admissionController');
const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(authorize('admin', 'instructor'));

// @desc    Get all admissions with filtering and pagination
// @route   GET /api/admin/admissions
// @access  Private/Admin
router.get('/', getAllAdmissions);

// @desc    Get single admission by ID
// @route   GET /api/admin/admissions/:id
// @access  Private/Admin
router.get('/:id', getAdmissionById);

// @desc    Update admission status
// @route   PUT /api/admin/admissions/:id/status
// @access  Private/Admin
router.put('/:id/status', updateAdmissionStatus);

// @desc    Delete admission
// @route   DELETE /api/admin/admissions/:id
// @access  Private/Admin
router.delete('/:id', deleteAdmission);

module.exports = router;