const Community = require('../models/Community');
const fs = require('fs');
const path = require('path');

// @desc    Get all community members
// @route   GET /api/community
// @access  Public
const getCommunityMembers = async (req, res) => {
  try {
    const members = await Community.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        members,
        count: members.length
      }
    });
  } catch (error) {
    console.error('Error fetching community members:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching community members',
      error: error.message
    });
  }
};

// @desc    Get single community member
// @route   GET /api/community/:id
// @access  Public
const getCommunityMember = async (req, res) => {
  try {
    const member = await Community.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Community member not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { member }
    });
  } catch (error) {
    console.error('Error fetching community member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching community member',
      error: error.message
    });
  }
};

// @desc    Create community member
// @route   POST /api/community
// @access  Private (Admin)
const createCommunityMember = async (req, res) => {
  try {
    const { name, role, belt } = req.body;
    
    if (!name || !role || !belt) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, role, and belt are required'
      });
    }
    
    const memberData = {
      name,
      role,
      belt,
      photo: req.file ? `uploads/community/${req.file.filename}` : null
    };
    
    const member = await Community.create(memberData);
    
    res.status(201).json({
      status: 'success',
      message: 'Community member created successfully',
      data: { member }
    });
  } catch (error) {
    console.error('Error creating community member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating community member',
      error: error.message
    });
  }
};

// @desc    Update community member
// @route   PUT /api/community/:id
// @access  Private (Admin)
const updateCommunityMember = async (req, res) => {
  try {
    const { name, role, belt } = req.body;
    
    const member = await Community.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Community member not found'
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
    member.role = role || member.role;
    member.belt = belt || member.belt;
    
    if (req.file) {
      member.photo = `uploads/community/${req.file.filename}`;
    }
    
    await member.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Community member updated successfully',
      data: { member }
    });
  } catch (error) {
    console.error('Error updating community member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating community member',
      error: error.message
    });
  }
};

// @desc    Delete community member
// @route   DELETE /api/community/:id
// @access  Private (Admin)
const deleteCommunityMember = async (req, res) => {
  try {
    const member = await Community.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Community member not found'
      });
    }
    
    // Delete photo file (only for local files)
    if (member.photo && !member.photo.startsWith('http')) {
      const photoPath = path.join(__dirname, '..', member.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    await Community.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Community member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting community member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting community member',
      error: error.message
    });
  }
};

module.exports = {
  getCommunityMembers,
  getCommunityMember,
  createCommunityMember,
  updateCommunityMember,
  deleteCommunityMember
};
