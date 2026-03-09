const Achievement = require('../models/Achievement');
const fs = require('fs');
const path = require('path');

// Get all achievements
exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ type: 1, order: 1 });
    
    res.status(200).json({
      status: 'success',
      results: achievements.length,
      data: {
        achievements
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get achievements by type
exports.getAchievementsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['instructor', 'student'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid type. Must be either "instructor" or "student"'
      });
    }
    
    const achievements = await Achievement.find({ type }).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      results: achievements.length,
      data: {
        achievements
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single achievement
exports.getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({
        status: 'error',
        message: 'Achievement not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        achievement
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create achievement
exports.createAchievement = async (req, res) => {
  try {
    const { type, description, order } = req.body;
    
    if (!type || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Type and description are required'
      });
    }
    
    if (!['instructor', 'student'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid type. Must be either "instructor" or "student"'
      });
    }
    
    const achievementData = {
      type,
      description,
      order: order || 0
    };
    
    if (req.file) {
      if (req.file.path && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'))) {
        achievementData.photo = req.file.path;
        console.log('☁️ Achievement photo uploaded to Cloudinary:', req.file.path);
      } else {
        achievementData.photo = req.file.path;
        console.log('📁 Achievement photo uploaded locally:', req.file.path);
      }
    }
    
    const achievement = await Achievement.create(achievementData);
    
    res.status(201).json({
      status: 'success',
      message: 'Achievement created successfully',
      data: {
        achievement
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update achievement
exports.updateAchievement = async (req, res) => {
  try {
    const { type, description, order } = req.body;
    
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({
        status: 'error',
        message: 'Achievement not found'
      });
    }
    
    if (type && !['instructor', 'student'].includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid type. Must be either "instructor" or "student"'
      });
    }
    
    // Update fields
    if (type) achievement.type = type;
    if (description) achievement.description = description;
    if (order !== undefined) achievement.order = order;
    
    // Handle photo update
    if (req.file) {
      // Delete old photo if exists
      if (achievement.photo && fs.existsSync(achievement.photo)) {
        fs.unlinkSync(achievement.photo);
      }
      if (req.file.path && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'))) {
        achievement.photo = req.file.path;
        console.log('☁️ Achievement photo updated to Cloudinary:', req.file.path);
      } else {
        achievement.photo = req.file.path;
        console.log('📁 Achievement photo updated locally:', req.file.path);
      }
    }
    
    await achievement.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Achievement updated successfully',
      data: {
        achievement
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete achievement
exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({
        status: 'error',
        message: 'Achievement not found'
      });
    }
    
    // Delete photo if exists
    if (achievement.photo && fs.existsSync(achievement.photo)) {
      fs.unlinkSync(achievement.photo);
    }
    
    await Achievement.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
