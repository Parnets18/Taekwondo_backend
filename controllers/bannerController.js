const Banner = require('../models/Banner');
const fs = require('fs');
const path = require('path');

// Get all banners (public)
exports.getAllBanners = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = isActive ? { isActive: true } : {};
    
    const banners = await Banner.find(filter).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      results: banners.length,
      data: {
        banners
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single banner
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Banner not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        banner
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create banner (admin)
exports.createBanner = async (req, res) => {
  try {
    const bannerData = {
      ...req.body
    };
    
    // Only add image if file was uploaded
    if (req.file) {
      bannerData.image = `uploads/banners/${req.file.filename}`;
    }
    
    const banner = await Banner.create(bannerData);
    
    res.status(201).json({
      status: 'success',
      data: {
        banner
      }
    });
  } catch (error) {
    // Delete uploaded file if banner creation fails
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'banners', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update banner (admin)
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Banner not found'
      });
    }
    
    // If new image is uploaded, delete old image
    if (req.file) {
      if (banner.image) {
        const oldImagePath = path.join(__dirname, '..', banner.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.body.image = `uploads/banners/${req.file.filename}`;
    }
    
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        banner: updatedBanner
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete banner (admin)
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        status: 'error',
        message: 'Banner not found'
      });
    }
    
    // Delete image file
    if (banner.image) {
      const imagePath = path.join(__dirname, '..', banner.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Banner.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update banner order (admin)
exports.updateBannerOrder = async (req, res) => {
  try {
    const { banners } = req.body; // Array of { id, order }
    
    const updatePromises = banners.map(({ id, order }) =>
      Banner.findByIdAndUpdate(id, { order })
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      status: 'success',
      message: 'Banner order updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
