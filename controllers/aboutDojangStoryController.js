const AboutDojangStory = require('../models/AboutDojangStory');
const fs = require('fs');
const path = require('path');

// Get active about dojang story (public)
const getAboutDojangStory = async (req, res) => {
  try {
    const story = await AboutDojangStory.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .select('-__v');

    if (!story) {
      return res.status(404).json({
        status: 'error',
        message: 'About dojang story not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { story }
    });
  } catch (error) {
    console.error('Error fetching about dojang story:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching about dojang story',
      error: error.message
    });
  }
};

// Get all about dojang stories (admin)
const getAllAboutDojangStories = async (req, res) => {
  try {
    const stories = await AboutDojangStory.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      status: 'success',
      data: {
        stories,
        count: stories.length
      }
    });
  } catch (error) {
    console.error('Error fetching about dojang stories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching about dojang stories',
      error: error.message
    });
  }
};

// Create about dojang story (admin)
const createAboutDojangStory = async (req, res) => {
  try {
    console.log('📝 About dojang story create request received');
    console.log('📋 Request body:', req.body);
    console.log('📁 Request file:', req.file);

    const { title, description } = req.body;

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        status: 'error',
        message: 'Photo is required'
      });
    }

    // Store relative path for local files
    const photoPath = `uploads/about/dojang-story/${req.file.filename}`;
    console.log(`📸 Saving dojang story photo: ${photoPath}`);

    const storyData = {
      title: title || 'Our Dojang Story',
      description,
      photo: photoPath,
      updatedBy: req.user?._id
    };

    console.log('💾 About dojang story data to save:', storyData);

    const story = new AboutDojangStory(storyData);
    await story.save();

    console.log(`✅ About dojang story saved to database with ID: ${story._id}`);

    res.status(201).json({
      status: 'success',
      message: 'About dojang story created successfully',
      data: { story }
    });
  } catch (error) {
    console.error('❌ Error creating about dojang story:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating about dojang story',
      error: error.message
    });
  }
};

// Update about dojang story (admin)
const updateAboutDojangStory = async (req, res) => {
  try {
    const { title, description, isActive } = req.body;

    const story = await AboutDojangStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        status: 'error',
        message: 'About dojang story not found'
      });
    }

    // Update fields
    if (title !== undefined) story.title = title;
    if (description !== undefined) story.description = description;
    if (isActive !== undefined) story.isActive = isActive;
    story.updatedBy = req.user?._id;

    // Update photo if new file uploaded
    if (req.file) {
      // Delete old photo file if it exists
      if (story.photo && !story.photo.startsWith('http')) {
        const oldPhotoPath = path.join(__dirname, '..', story.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
          console.log(`🗑️ Deleted old photo: ${oldPhotoPath}`);
        }
      }
      story.photo = `uploads/about/dojang-story/${req.file.filename}`;
      console.log(`📸 Updated photo path: ${story.photo}`);
    }

    await story.save();

    res.status(200).json({
      status: 'success',
      message: 'About dojang story updated successfully',
      data: { story }
    });
  } catch (error) {
    console.error('Error updating about dojang story:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating about dojang story',
      error: error.message
    });
  }
};

// Delete about dojang story (admin)
const deleteAboutDojangStory = async (req, res) => {
  try {
    const story = await AboutDojangStory.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        status: 'error',
        message: 'About dojang story not found'
      });
    }

    // Delete photo file if it exists
    if (story.photo && !story.photo.startsWith('http')) {
      const photoPath = path.join(__dirname, '..', story.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await AboutDojangStory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'About dojang story deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting about dojang story:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting about dojang story',
      error: error.message
    });
  }
};

module.exports = {
  getAboutDojangStory,
  getAllAboutDojangStories,
  createAboutDojangStory,
  updateAboutDojangStory,
  deleteAboutDojangStory
};
