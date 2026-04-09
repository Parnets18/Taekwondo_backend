const BlackBelt = require('../models/BlackBelt');
const fs = require('fs');
const path = require('path');

// @desc    Get all black belt members
// @route   GET /api/black-belt
// @access  Public
const getBlackBeltMembers = async (req, res) => {
  try {
    const members = await BlackBelt.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        members,
        count: members.length
      }
    });
  } catch (error) {
    console.error('Error fetching black belt members:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching black belt members',
      error: error.message
    });
  }
};

// @desc    Get single black belt member
// @route   GET /api/black-belt/:id
// @access  Public
const getBlackBeltMember = async (req, res) => {
  try {
    const member = await BlackBelt.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Black belt member not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { member }
    });
  } catch (error) {
    console.error('Error fetching black belt member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching black belt member',
      error: error.message
    });
  }
};

// @desc    Create black belt member
// @route   POST /api/black-belt
// @access  Private (Admin)
const createBlackBeltMember = async (req, res) => {
  try {
    const { name, belt, yearsTraining, achievements } = req.body;
    
    if (!name || !belt || !yearsTraining || !achievements) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, belt, years of training, and achievements are required'
      });
    }
    
    const memberData = {
      name,
      belt,
      yearsTraining,
      achievements,
      photo: req.file ? `uploads/black-belt/${req.file.filename}` : null
    };
    
    const member = await BlackBelt.create(memberData);
    
    res.status(201).json({
      status: 'success',
      message: 'Black belt member created successfully',
      data: { member }
    });
  } catch (error) {
    console.error('Error creating black belt member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating black belt member',
      error: error.message
    });
  }
};

// @desc    Update black belt member
// @route   PUT /api/black-belt/:id
// @access  Private (Admin)
const updateBlackBeltMember = async (req, res) => {
  try {
    const { name, belt, yearsTraining, achievements } = req.body;
    
    const member = await BlackBelt.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Black belt member not found'
      });
    }
    
    // Delete old photo if new one is uploaded (only for local files)
    if (req.file && member.photo && !member.photo.startsWith('http')) {
      const oldPhotoPath = path.join(__dirname, '..', member.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }
    
    member.name = name || member.name;
    member.belt = belt || member.belt;
    member.yearsTraining = yearsTraining || member.yearsTraining;
    member.achievements = achievements || member.achievements;
    
    if (req.file) {
      if (req.file.path && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'))) {
        member.photo = req.file.path;
      } else {
        member.photo = `uploads/black-belt/${req.file.filename}`;
        console.log('📁 Black belt photo updated locally:', member.photo);
      }
    }
    
    await member.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Black belt member updated successfully',
      data: { member }
    });
  } catch (error) {
    console.error('Error updating black belt member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating black belt member',
      error: error.message
    });
  }
};

// @desc    Delete black belt member
// @route   DELETE /api/black-belt/:id
// @access  Private (Admin)
const deleteBlackBeltMember = async (req, res) => {
  try {
    const member = await BlackBelt.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Black belt member not found'
      });
    }
    
    // Delete photo file (only for local files)
    if (member.photo && !member.photo.startsWith('http')) {
      const photoPath = path.join(__dirname, '..', member.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    await BlackBelt.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Black belt member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting black belt member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting black belt member',
      error: error.message
    });
  }
};

module.exports = {
  getBlackBeltMembers,
  getBlackBeltMember,
  createBlackBeltMember,
  updateBlackBeltMember,
  deleteBlackBeltMember
};
