const AboutSection = require('../models/AboutSection');
const fs = require('fs');
const path = require('path');

// Get active about section (public)
const getAboutSection = async (req, res) => {
  try {
    const aboutSection = await AboutSection.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .select('-__v');

    if (!aboutSection) {
      return res.status(404).json({
        status: 'error',
        message: 'About section not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { aboutSection }
    });
  } catch (error) {
    console.error('Error fetching about section:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching about section',
      error: error.message
    });
  }
};

// Get all about sections (admin)
const getAllAboutSections = async (req, res) => {
  try {
    const aboutSections = await AboutSection.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      status: 'success',
      data: {
        aboutSections,
        count: aboutSections.length
      }
    });
  } catch (error) {
    console.error('Error fetching about sections:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching about sections',
      error: error.message
    });
  }
};

// Create about section (admin)
const createAboutSection = async (req, res) => {
  try {
    console.log('📝 About section create request received');
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
    const photoPath = `uploads/about/home/${req.file.filename}`;
    console.log(`📸 Saving about photo: ${photoPath}`);

    const aboutData = {
      title: title || 'About Combat Warrior Dojang',
      description,
      photo: photoPath,
      updatedBy: req.user?._id
    };

    console.log('💾 About section data to save:', aboutData);

    const aboutSection = new AboutSection(aboutData);
    await aboutSection.save();

    console.log(`✅ About section saved to database with ID: ${aboutSection._id}`);

    res.status(201).json({
      status: 'success',
      message: 'About section created successfully',
      data: { aboutSection }
    });
  } catch (error) {
    console.error('❌ Error creating about section:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating about section',
      error: error.message
    });
  }
};

// Update about section (admin)
const updateAboutSection = async (req, res) => {
  try {
    const { title, description, isActive } = req.body;

    const aboutSection = await AboutSection.findById(req.params.id);

    if (!aboutSection) {
      return res.status(404).json({
        status: 'error',
        message: 'About section not found'
      });
    }

    // Update fields
    if (title !== undefined) aboutSection.title = title;
    if (description !== undefined) aboutSection.description = description;
    if (isActive !== undefined) aboutSection.isActive = isActive;
    aboutSection.updatedBy = req.user?._id;

    // Update photo if new file uploaded
    if (req.file) {
      // Delete old photo file if it exists
      if (aboutSection.photo && !aboutSection.photo.startsWith('http')) {
        const oldPhotoPath = path.join(__dirname, '..', aboutSection.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
          console.log(`🗑️ Deleted old photo: ${oldPhotoPath}`);
        }
      }
      aboutSection.photo = `uploads/about/home/${req.file.filename}`;
      console.log(`📸 Updated photo path: ${aboutSection.photo}`);
    }

    await aboutSection.save();

    res.status(200).json({
      status: 'success',
      message: 'About section updated successfully',
      data: { aboutSection }
    });
  } catch (error) {
    console.error('Error updating about section:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating about section',
      error: error.message
    });
  }
};

// Delete about section (admin)
const deleteAboutSection = async (req, res) => {
  try {
    const aboutSection = await AboutSection.findById(req.params.id);

    if (!aboutSection) {
      return res.status(404).json({
        status: 'error',
        message: 'About section not found'
      });
    }

    // Delete photo file if it exists
    if (aboutSection.photo && !aboutSection.photo.startsWith('http')) {
      const photoPath = path.join(__dirname, '..', aboutSection.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await AboutSection.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'About section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting about section:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting about section',
      error: error.message
    });
  }
};

module.exports = {
  getAboutSection,
  getAllAboutSections,
  createAboutSection,
  updateAboutSection,
  deleteAboutSection
};
