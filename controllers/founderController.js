const { Founder, FounderDescription } = require('../models/Founder');
const fs = require('fs').promises;

// Get all founders and description
exports.getAllFounders = async (req, res) => {
  try {
    const founders = await Founder.find({ isActive: true }).sort({ order: 1 });
    const description = await FounderDescription.findOne();
    
    res.status(200).json({
      status: 'success',
      data: {
        founders,
        description: description ? description.description : ''
      }
    });
  } catch (error) {
    console.error('Error fetching founders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching founders',
      error: error.message
    });
  }
};

// Create founder
exports.createFounder = async (req, res) => {
  try {
    const { name, title, order } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Photo is required'
      });
    }
    
    const founder = await Founder.create({
      name,
      title,
      order: order || 0,
      photo: req.file.path.replace(/\\/g, '/')
    });
    
    res.status(201).json({
      status: 'success',
      data: { founder }
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
    }
    console.error('Error creating founder:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating founder',
      error: error.message
    });
  }
};

// Update founder
exports.updateFounder = async (req, res) => {
  try {
    const { name, title, order } = req.body;
    const founder = await Founder.findById(req.params.id);
    
    if (!founder) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
      }
      return res.status(404).json({
        status: 'error',
        message: 'Founder not found'
      });
    }
    
    if (name) founder.name = name;
    if (title) founder.title = title;
    if (order !== undefined) founder.order = order;
    
    if (req.file) {
      if (founder.photo) {
        await fs.unlink(founder.photo).catch(err => console.error('Error deleting old photo:', err));
      }
      founder.photo = req.file.path.replace(/\\/g, '/');
    }
    
    await founder.save();
    
    res.status(200).json({
      status: 'success',
      data: { founder }
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('Error deleting file:', err));
    }
    console.error('Error updating founder:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating founder',
      error: error.message
    });
  }
};

// Delete founder
exports.deleteFounder = async (req, res) => {
  try {
    const founder = await Founder.findById(req.params.id);
    
    if (!founder) {
      return res.status(404).json({
        status: 'error',
        message: 'Founder not found'
      });
    }
    
    if (founder.photo) {
      await fs.unlink(founder.photo).catch(err => console.error('Error deleting photo:', err));
    }
    
    await Founder.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Founder deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting founder:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting founder',
      error: error.message
    });
  }
};

// Update description
exports.updateDescription = async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({
        status: 'error',
        message: 'Description is required'
      });
    }
    
    let desc = await FounderDescription.findOne();
    
    if (desc) {
      desc.description = description;
      await desc.save();
    } else {
      desc = await FounderDescription.create({ description });
    }
    
    res.status(200).json({
      status: 'success',
      data: { description: desc }
    });
  } catch (error) {
    console.error('Error updating description:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating description',
      error: error.message
    });
  }
};
