const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const upload = require('../config/achievementUpload');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', achievementController.getAllAchievements);
router.get('/type/:type', achievementController.getAchievementsByType);
router.get('/:id', achievementController.getAchievement);

// Protected routes (admin only)
router.post('/', protect, upload.single('photo'), achievementController.createAchievement);
router.put('/:id', protect, upload.single('photo'), achievementController.updateAchievement);
router.delete('/:id', protect, achievementController.deleteAchievement);

module.exports = router;
