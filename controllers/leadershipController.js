const Leadership = require('../models/Leadership');
const path = require('path');
const fs = require('fs').promises;

// Get all leadership members
exports.getAllLeadership = async (req, res) => {
  try {
    const leadership = await Leadership.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');

    res.status(200).json({
      status: 'success',
      data: {
        leadership
      }
    });
  } catch (error) {
    console.error('Error fetching leadership:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leadership members'
    });
  }
};

// Get single leadership member
exports.getLeadershipById = async (req, res) => {
  try {
    const leadership = await Leadership.findById(req.params.id);

    if (!leadership) {
      return res.status(404).json({
        status: 'error',
        message: 'Leadership member not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        leadership
      }
    });
  } catch (error) {
    console.error('Error fetching leadership member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leadership member'
    });
  }
};

// Create leadership member
exports.createLeadership = async (req, res) => {
  try {
    const { name, rank, position, description, order } = req.body;

    const leadershipData = {
      name,
      rank,
      position,
      description,
      order: order || 0,
      updatedBy: req.user?.id
    };

    if (req.file) {
      leadershipData.photo = req.file.path.replace(/\\/g, '/');
    }

    const leadership = await Leadership.create(leadershipData);

    res.status(201).json({
      status: 'success',
      message: 'Leadership member created successfully',
      data: {
        leadership
      }
    });
  } catch (error) {
    console.error('Error creating leadership member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create leadership member',
      error: error.message
    });
  }
};

// Update leadership member
exports.updateLeadership = async (req, res) => {
  try {
    const { name, rank, position, description, order } = req.body;

    const leadership = await Leadership.findById(req.params.id);

    if (!leadership) {
      return res.status(404).json({
        status: 'error',
        message: 'Leadership member not found'
      });
    }

    // Update fields
    leadership.name = name || leadership.name;
    leadership.rank = rank || leadership.rank;
    leadership.position = position || leadership.position;
    leadership.description = description || leadership.description;
    leadership.order = order !== undefined ? order : leadership.order;
    leadership.updatedBy = req.user?.id;

    // Handle photo update
    if (req.file) {
      // Delete old photo if exists
      if (leadership.photo) {
        try {
          await fs.unlink(leadership.photo);
        } catch (err) {
          console.error('Error deleting old photo:', err);
        }
      }
      leadership.photo = req.file.path.replace(/\\/g, '/');
    }

    await leadership.save();

    res.status(200).json({
      status: 'success',
      message: 'Leadership member updated successfully',
      data: {
        leadership
      }
    });
  } catch (error) {
    console.error('Error updating leadership member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update leadership member',
      error: error.message
    });
  }
};

// Delete leadership member
exports.deleteLeadership = async (req, res) => {
  try {
    const leadership = await Leadership.findById(req.params.id);

    if (!leadership) {
      return res.status(404).json({
        status: 'error',
        message: 'Leadership member not found'
      });
    }

    // Delete photo if exists
    if (leadership.photo) {
      try {
        await fs.unlink(leadership.photo);
      } catch (err) {
        console.error('Error deleting photo:', err);
      }
    }

    await Leadership.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Leadership member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leadership member:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete leadership member'
    });
  }
};
