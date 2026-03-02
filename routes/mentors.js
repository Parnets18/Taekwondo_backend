const express = require('express');
const router = express.Router();
const {
  getMentors,
  getAllMentors,
  getMentor,
  createMentor,
  updateMentor,
  deleteMentor
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMentor } = require('../config/mentorUpload');

// Protected routes (admin only) - MUST come before /:id route
router.get('/admin/all', protect, authorize('admin'), getAllMentors);
router.post('/', protect, authorize('admin'), uploadMentor.single('photo'), createMentor);
router.put('/:id', protect, authorize('admin'), uploadMentor.single('photo'), updateMentor);
router.delete('/:id', protect, authorize('admin'), deleteMentor);

// Public routes - /:id must come AFTER /admin/all
router.get('/', getMentors);
router.get('/:id', getMentor);

module.exports = router;
