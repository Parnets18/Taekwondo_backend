const Mentor = require('../models/Mentor');
const fs = require('fs');
const path = require('path');

// Get all active mentors (public)
const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');

    res.status(200).json({
      status: 'success',
      data: {
        mentors,
        count: mentors.length
      }
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching mentors',
      error: error.message
    });
  }
};

// Get all mentors (admin)
const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find()
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');

    res.status(200).json({
      status: 'success',
      data: {
        mentors,
        count: mentors.length
      }
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching mentors',
      error: error.message
    });
  }
};

// Get single mentor
const getMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({
        status: 'error',
        message: 'Mentor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { mentor }
    });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching mentor',
      error: error.message
    });
  }
};

// Create mentor (admin)
const createMentor = async (req, res) => {
  try {
    console.log('📝 Mentor create request received');
    console.log('📋 Request body:', req.body);
    console.log('📁 Request file:', req.file);

    const { name, rank, position, description, order } = req.body;

    let photoPath = '';
    if (req.file) {
      photoPath = `uploads/about/mentors/${req.file.filename}`;
      console.log(`📸 Saving mentor photo: ${photoPath}`);
    }

    const mentorData = {
      name,
      rank,
      position,
      description: description || '',
      photo: photoPath,
      order: order || 0,
      updatedBy: req.user?._id
    };

    console.log('💾 Mentor data to save:', mentorData);

    const mentor = new Mentor(mentorData);
    await mentor.save();

    console.log(`✅ Mentor saved to database with ID: ${mentor._id}`);

    res.status(201).json({
      status: 'success',
      message: 'Mentor created successfully',
      data: { mentor }
    });
  } catch (error) {
    console.error('❌ Error creating mentor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating mentor',
      error: error.message
    });
  }
};

// Update mentor (admin)
const updateMentor = async (req, res) => {
  try {
    const { name, rank, position, description, order, isActive } = req.body;

    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({
        status: 'error',
        message: 'Mentor not found'
      });
    }

    // Update fields
    if (name !== undefined) mentor.name = name;
    if (rank !== undefined) mentor.rank = rank;
    if (position !== undefined) mentor.position = position;
    if (description !== undefined) mentor.description = description;
    if (order !== undefined) mentor.order = order;
    if (isActive !== undefined) mentor.isActive = isActive;
    mentor.updatedBy = req.user?._id;

    // Update photo if new file uploaded
    if (req.file) {
      // Delete old photo file if it exists
      if (mentor.photo && !mentor.photo.startsWith('http')) {
        const oldPhotoPath = path.join(__dirname, '..', mentor.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
          console.log(`🗑️ Deleted old photo: ${oldPhotoPath}`);
        }
      }
      mentor.photo = `uploads/about/mentors/${req.file.filename}`;
      console.log(`📸 Updated photo path: ${mentor.photo}`);
    }

    await mentor.save();

    res.status(200).json({
      status: 'success',
      message: 'Mentor updated successfully',
      data: { mentor }
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating mentor',
      error: error.message
    });
  }
};

// Delete mentor (admin)
const deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({
        status: 'error',
        message: 'Mentor not found'
      });
    }

    // Delete photo file if it exists
    if (mentor.photo && !mentor.photo.startsWith('http')) {
      const photoPath = path.join(__dirname, '..', mentor.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Mentor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Mentor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting mentor',
      error: error.message
    });
  }
};

module.exports = {
  getMentors,
  getAllMentors,
  getMentor,
  createMentor,
  updateMentor,
  deleteMentor
};
