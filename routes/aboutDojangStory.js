const express = require('express');
const router = express.Router();
const {
  getAboutDojangStory,
  getAllAboutDojangStories,
  createAboutDojangStory,
  updateAboutDojangStory,
  deleteAboutDojangStory
} = require('../controllers/aboutDojangStoryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadDojangStory } = require('../config/aboutDojangUpload');

// Public routes
router.get('/', getAboutDojangStory);

// Protected routes (admin only)
router.get('/all', protect, authorize('admin'), getAllAboutDojangStories);
router.post('/', protect, authorize('admin'), uploadDojangStory.single('photo'), createAboutDojangStory);
router.put('/:id', protect, authorize('admin'), uploadDojangStory.single('photo'), updateAboutDojangStory);
router.delete('/:id', protect, authorize('admin'), deleteAboutDojangStory);

module.exports = router;
