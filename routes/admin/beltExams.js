const express = require('express');
const {
  getAllBeltExams,
  getBeltExamById,
  deleteBeltExam
} = require('../../controllers/beltExamController');

const router = express.Router();

// @desc    Get all belt exams
// @route   GET /api/admin/belt-exams
// @access  Private/Admin
router.get('/', getAllBeltExams);

// @desc    Get single belt exam
// @route   GET /api/admin/belt-exams/:id
// @access  Private/Admin
router.get('/:id', getBeltExamById);

// @desc    Delete belt exam
// @route   DELETE /api/admin/belt-exams/:id
// @access  Private/Admin
router.delete('/:id', deleteBeltExam);

module.exports = router;
