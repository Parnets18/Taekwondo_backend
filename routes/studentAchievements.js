const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const Student = require('../models/Student');
const { protect, adminOnly, staffOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all achievements (Admin/Instructor only)
router.get('/', staffOnly, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const achievements = await Achievement.find()
      .populate('studentId', 'fullName studentId')
      .populate('badgeId')
      .populate('certificateId')
      .sort({ dateAchieved: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Achievement.countDocuments();

    res.json({
      success: true,
      achievements,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new achievement
router.post('/', [
  staffOnly,
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('type').isIn([
    'belt_promotion', 'course_completion', 'perfect_attendance',
    'tournament_participation', 'tournament_winner', 'years_of_training',
    'instructor_recognition', 'community_service'
  ]).withMessage('Invalid achievement type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Determine category based on type
    const categoryMap = {
      'belt_promotion': 'belt_promotion',
      'course_completion': 'course_completion',
      'perfect_attendance': 'attendance',
      'tournament_participation': 'tournament',
      'tournament_winner': 'tournament',
      'years_of_training': 'special',
      'instructor_recognition': 'special',
      'community_service': 'special'
    };

    const achievementData = {
      studentId: req.body.studentId,
      type: req.body.type,
      category: categoryMap[req.body.type],
      title: req.body.title,
      description: req.body.description,
      points: req.body.points || 0,
      metadata: req.body.metadata || {}
    };

    const achievement = new Achievement(achievementData);
    await achievement.save();

    // Check for automatic badge awarding
    await checkAndAwardBadges(req.body.studentId, req.body.type, achievementData);

    await achievement.populate('studentId', 'fullName studentId');
    
    res.json({
      success: true,
      message: 'Achievement created successfully',
      achievement
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create achievement' 
    });
  }
});

// Get student achievements (for student portal)
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && 
        req.user.studentId !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const achievements = await Achievement.find({ studentId: req.params.studentId })
      .populate('badgeId')
      .populate('certificateId')
      .sort({ dateAchieved: -1 });

    // Calculate total points
    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

    // Get next milestones
    const nextMilestones = await calculateNextMilestones(req.params.studentId);

    res.json({
      success: true,
      achievements,
      totalPoints,
      nextMilestones
    });
  } catch (error) {
    console.error('Error fetching student achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get achievement analytics
router.get('/analytics', adminOnly, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const analytics = await Achievement.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' },
          avgPoints: { $avg: '$points' }
        }
      }
    ]);

    const totalAchievements = await Achievement.countDocuments();
    const totalStudentsWithAchievements = await Achievement.distinct('studentId').then(ids => ids.length);

    res.json({
      success: true,
      analytics: {
        total: totalAchievements,
        studentsWithAchievements: totalStudentsWithAchievements,
        byCategory: analytics
      }
    });
  } catch (error) {
    console.error('Error fetching achievement analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to check and award badges
async function checkAndAwardBadges(studentId, achievementType, achievementData) {
  try {
    const badges = await Badge.find({ 
      isActive: true,
      'criteria.type': achievementType 
    });

    for (const badge of badges) {
      const shouldAward = await evaluateBadgeCriteria(studentId, badge, achievementData);
      if (shouldAward) {
        // Check if student already has this badge
        const existingAchievement = await Achievement.findOne({
          studentId: studentId,
          badgeId: badge._id
        });

        if (!existingAchievement) {
          // Award the badge
          const badgeAchievement = new Achievement({
            studentId: studentId,
            type: 'badge_earned',
            category: 'special',
            title: `Badge Earned: ${badge.name}`,
            description: badge.description,
            points: badge.points,
            badgeId: badge._id
          });
          await badgeAchievement.save();
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}

// Helper function to evaluate badge criteria
async function evaluateBadgeCriteria(studentId, badge, achievementData) {
  try {
    const criteria = badge.criteria;
    
    switch (criteria.type) {
      case 'attendance':
        if (criteria.requirements.attendancePercentage) {
          const student = await Student.findById(studentId);
          return student && student.attendancePercentage >= criteria.requirements.attendancePercentage;
        }
        break;
        
      case 'belt_promotion':
        if (criteria.requirements.beltLevel) {
          return achievementData.metadata.beltLevel === criteria.requirements.beltLevel;
        }
        break;
        
      case 'course_completion':
        if (criteria.requirements.courseLevel) {
          return achievementData.metadata.courseLevel === criteria.requirements.courseLevel;
        }
        break;
        
      case 'years_service':
        if (criteria.requirements.yearsRequired) {
          const student = await Student.findById(studentId);
          if (student) {
            const yearsEnrolled = (Date.now() - student.enrollmentDate) / (1000 * 60 * 60 * 24 * 365);
            return yearsEnrolled >= criteria.requirements.yearsRequired;
          }
        }
        break;
    }
    
    return false;
  } catch (error) {
    console.error('Error evaluating badge criteria:', error);
    return false;
  }
}

// Helper function to calculate next milestones
async function calculateNextMilestones(studentId) {
  try {
    const student = await Student.findById(studentId);
    if (!student) return [];

    const milestones = [];

    // Next belt milestone
    const beltOrder = ['white', 'yellow', 'green', 'blue', 'red', 'black-1st', 'black-2nd', 'black-3rd'];
    const currentBeltIndex = beltOrder.indexOf(student.currentBelt);
    if (currentBeltIndex < beltOrder.length - 1) {
      milestones.push({
        title: `Next Belt: ${beltOrder[currentBeltIndex + 1]}`,
        description: 'Continue training to achieve your next belt level',
        current: currentBeltIndex + 1,
        target: currentBeltIndex + 2
      });
    }

    // Attendance milestone
    const attendancePercentage = student.attendancePercentage || 0;
    if (attendancePercentage < 95) {
      milestones.push({
        title: 'Perfect Attendance',
        description: 'Achieve 95% attendance rate',
        current: attendancePercentage,
        target: 95
      });
    }

    return milestones;
  } catch (error) {
    console.error('Error calculating milestones:', error);
    return [];
  }
}

module.exports = router;