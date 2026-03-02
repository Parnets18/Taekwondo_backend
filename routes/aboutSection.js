const express = require('express');
const router = express.Router();
const {
  getAboutSection,
  getAllAboutSections,
  createAboutSection,
  updateAboutSection,
  deleteAboutSection
} = require('../controllers/aboutSectionController');
const { protect, authorize } = require('../middleware/auth');
const { uploadAbout } = require('../config/aboutUpload');

// Public routes
router.get('/', getAboutSection);

// Protected routes (admin only)
router.get('/all', protect, authorize('admin'), getAllAboutSections);
router.post('/', protect, authorize('admin'), uploadAbout.single('photo'), createAboutSection);
router.put('/:id', protect, authorize('admin'), uploadAbout.single('photo'), updateAboutSection);
router.delete('/:id', protect, authorize('admin'), deleteAboutSection);

module.exports = router;
