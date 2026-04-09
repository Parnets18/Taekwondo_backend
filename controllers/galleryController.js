const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

// Get all gallery photos (public), optional ?category= filter
const getGalleryPhotos = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category && req.query.category !== 'All') {
      // Match exact category OR treat missing category as 'Our Memories'
      if (req.query.category === 'Our Memories') {
        filter.$or = [{ category: 'Our Memories' }, { category: { $exists: false } }, { category: null }];
      } else {
        filter.category = req.query.category;
      }
    }

    const photos = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');

    // Ensure every photo has a category (backfill for old records)
    const normalised = photos.map(p => {
      const obj = p.toObject();
      if (!obj.category) obj.category = 'Our Memories';
      return obj;
    });

    res.status(200).json({
      status: 'success',
      data: {
        photos: normalised,
        count: normalised.length
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
    console.log('📁 Request files:', req.files);

    if (!req.files || req.files.length === 0) {
      console.log('❌ No files in request');
      return res.status(400).json({
        status: 'error',
        message: 'At least one photo is required'
      });
    }

    const uploadedPhotos = [];

    // Process each uploaded file
    for (const file of req.files) {
      const photoPath = `uploads/gallery/${file.filename}`;
      console.log(`📸 Saving gallery photo: ${photoPath}`);

      // Query param is most reliable with multipart (body may not be parsed yet)
      const category = req.query.uploadCategory || req.body.category || 'Our Memories';
      const photoData = {
        photo: photoPath,
        category,
        uploadedBy: req.user?._id
      };

      const photo = new Gallery(photoData);
      await photo.save();
      uploadedPhotos.push(photo);

      console.log(`✅ Gallery photo saved to database with ID: ${photo._id}`);
    }

    res.status(201).json({
      status: 'success',
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      data: { photos: uploadedPhotos }
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
    const { isActive, category } = req.body;

    const photo = await Gallery.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        status: 'error',
        message: 'Photo not found'
      });
    }

    if (isActive !== undefined) photo.isActive = isActive;
    if (category) photo.category = category;

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
      
      if (req.file.path && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'))) {
        photo.photo = req.file.path;
      } else {
        photo.photo = `uploads/gallery/${req.file.filename}`;
        console.log('📁 Gallery photo updated locally:', photo.photo);
      }
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

    // Delete local photo file
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
