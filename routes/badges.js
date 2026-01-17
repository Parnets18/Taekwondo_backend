const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const Achievement = require('../models/Achievement');
const { protect, adminOnly, staffOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all badges
router.get('/', protect, async (req, res) => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      badges
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new badge (Admin only)
router.post('/', [
  adminOnly,
  body('name').notEmpty().withMessage('Badge name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('rarity').isIn(['common', 'uncommon', 'rare', 'legendary']).withMessage('Invalid rarity'),
  body('points').isInt({ min: 0 }).withMessage('Points must be a positive integer'),
  body('criteria.type').isIn(['attendance', 'belt_promotion', 'course_completion', 'tournament', 'years_service', 'special']).withMessage('Invalid criteria type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const badgeData = {
      name: req.body.name,
      description: req.body.description,
      iconUrl: req.body.iconUrl || '/default-badge-icon.png',
      rarity: req.body.rarity,
      points: req.body.points,
      criteria: req.body.criteria
    };

    const badge = new Badge(badgeData);
    await badge.save();

    res.json({
      success: true,
      message: 'Badge created successfully',
      badge
    });
  } catch (error) {
    console.error('Error creating badge:', error);
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false,
        message: 'Badge name already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to create badge' 
      });
    }
  }
});

// Get badge by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    res.json({ success: true, badge });
  } catch (error) {
    console.error('Error fetching badge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update badge (Admin only)
router.put('/:id', [
  adminOnly,
  body('name').optional().notEmpty().withMessage('Badge name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('rarity').optional().isIn(['common', 'uncommon', 'rare', 'legendary']).withMessage('Invalid rarity'),
  body('points').optional().isInt({ min: 0 }).withMessage('Points must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        badge[key] = req.body[key];
      }
    });

    await badge.save();

    res.json({
      success: true,
      message: 'Badge updated successfully',
      badge
    });
  } catch (error) {
    console.error('Error updating badge:', error);
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false,
        message: 'Badge name already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to update badge' 
      });
    }
  }
});

// Toggle badge active status (Admin only)
router.put('/:id/toggle', adminOnly, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    badge.isActive = !badge.isActive;
    await badge.save();

    res.json({
      success: true,
      message: `Badge ${badge.isActive ? 'activated' : 'deactivated'} successfully`,
      badge
    });
  } catch (error) {
    console.error('Error toggling badge status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student badges (for student portal)
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && 
        req.user.studentId !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get achievements that have badges
    const achievements = await Achievement.find({ 
      studentId: req.params.studentId,
      badgeId: { $exists: true, $ne: null }
    }).populate('badgeId');

    const badges = achievements.map(achievement => ({
      ...achievement.badgeId.toObject(),
      earnedDate: achievement.dateAchieved,
      achievementId: achievement._id
    }));

    res.json({
      success: true,
      badges
    });
  } catch (error) {
    console.error('Error fetching student badges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get badge statistics (Admin only)
router.get('/stats/overview', adminOnly, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalBadges = await Badge.countDocuments();
    const activeBadges = await Badge.countDocuments({ isActive: true });
    
    const rarityStats = await Badge.aggregate([
      {
        $group: {
          _id: '$rarity',
          count: { $sum: 1 }
        }
      }
    ]);

    const awardedStats = await Achievement.aggregate([
      {
        $match: { badgeId: { $exists: true, $ne: null } }
      },
      {
        $lookup: {
          from: 'badges',
          localField: 'badgeId',
          foreignField: '_id',
          as: 'badge'
        }
      },
      {
        $unwind: '$badge'
      },
      {
        $group: {
          _id: '$badge.rarity',
          awarded: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalBadges,
        active: activeBadges,
        byRarity: rarityStats,
        awarded: awardedStats
      }
    });
  } catch (error) {
    console.error('Error fetching badge stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete badge (Admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    // Check if badge has been awarded to any students
    const awardedCount = await Achievement.countDocuments({ badgeId: req.params.id });
    if (awardedCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete badge. It has been awarded to ${awardedCount} student(s).` 
      });
    }

    await Badge.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Badge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting badge:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;