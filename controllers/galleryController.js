const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

// Get all gallery photos (public)
const getGalleryPhotos = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { isActive: true };
    if (category && category !== 'All') {
      query.category = category;
    }

    const photos = await Gallery.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      status: 'success',
      data: {
        photos,
        count: photos.length
      }
    });
  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching gallery photos',
      error: error.message
    });
  }
};

// Get single gallery photo
const getGalleryPhoto = async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        status: 'error',
        message: 'Photo not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { photo }
    });
  } catch (error) {
    console.error('Error fetching gallery photo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching gallery photo',
      error: error.message
    });
  }
};

// Create gallery photo (admin)
const createGalleryPhoto = async (req, res) => {
  try {
    console.log('📸 Gallery upload request received');
    console.log('📋 Request body:', req.body);
    console.log('📁 Request file:', req.file);

    const { title, description, category } = req.body;

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        status: 'error',
        message: 'Photo is required'
      });
    }

    // Store relative path for local files
    const photoPath = `uploads/gallery/${req.file.filename}`;
    console.log(`📸 Saving gallery photo: ${photoPath}`);
    console.log(`📂 Full file path: ${req.file.path}`);

    const photoData = {
      title: title || '',
      description: description || '',
      category: category || 'Other',
      photo: photoPath,
      uploadedBy: req.user?._id
    };

    console.log('💾 Photo data to save:', photoData);

    const photo = new Gallery(photoData);
    await photo.save();

    console.log(`✅ Gallery photo saved to database with ID: ${photo._id}`);
    console.log(`✅ Photo path in DB: ${photo.photo}`);

    res.status(201).json({
      status: 'success',
      message: 'Photo uploaded successfully',
      data: { photo }
    });
  } catch (error) {
    console.error('❌ Error creating gallery photo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error uploading photo',
      error: error.message
    });
  }
};

// Update gallery photo (admin)
const updateGalleryPhoto = async (req, res) => {
  try {
    const { title, description, category, isActive } = req.body;

    const photo = await Gallery.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        status: 'error',
        message: 'Photo not found'
      });
    }

    // Update fields
    if (title !== undefined) photo.title = title;
    if (description !== undefined) photo.description = description;
    if (category !== undefined) photo.category = category;
    if (isActive !== undefined) photo.isActive = isActive;

    // Update photo if new file uploaded
    if (req.file) {
      // Delete old photo file if it exists
      if (photo.photo && !photo.photo.startsWith('http')) {
        const oldPhotoPath = path.join(__dirname, '..', photo.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
          console.log(`🗑️ Deleted old photo: ${oldPhotoPath}`);
        }
      }
      photo.photo = `uploads/gallery/${req.file.filename}`;
      console.log(`📸 Updated photo path: ${photo.photo}`);
    }

    await photo.save();

    res.status(200).json({
      status: 'success',
      message: 'Photo updated successfully',
      data: { photo }
    });
  } catch (error) {
    console.error('Error updating gallery photo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating photo',
      error: error.message
    });
  }
};

// Delete gallery photo (admin)
const deleteGalleryPhoto = async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        status: 'error',
        message: 'Photo not found'
      });
    }

    // Only delete local photo file (not Cloudinary URLs)
    if (photo.photo && !photo.photo.startsWith('http')) {
      const photoPath = path.join(__dirname, '..', photo.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery photo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting photo',
      error: error.message
    });
  }
};

module.exports = {
  getGalleryPhotos,
  getGalleryPhoto,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto
};
