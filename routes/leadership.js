const express = require('express');
const router = express.Router();
const leadershipController = require('../controllers/leadershipController');
const upload = require('../config/leadershipUpload');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', leadershipController.getAllLeadership);
router.get('/:id', leadershipController.getLeadershipById);

// Protected routes (admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('photo'),
  leadershipController.createLeadership
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('photo'),
  leadershipController.updateLeadership
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  leadershipController.deleteLeadership
);

module.exports = router;
