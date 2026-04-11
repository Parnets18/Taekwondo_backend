const express = require('express');
const router = express.Router();
const OnboardingSlide = require('../models/OnboardingSlide');
const { uploadOnboarding } = require('../config/upload');

// GET all slides
router.get('/', async (req, res) => {
  try {
    const slides = await OnboardingSlide.find().sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single slide
router.get('/:id', async (req, res) => {
  try {
    const slide = await OnboardingSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper to parse points from FormData
const parsePoints = (body) => {
  if (body['points[]'] !== undefined) {
    return Array.isArray(body['points[]']) ? body['points[]'] : [body['points[]']];
  }
  if (body.points !== undefined) {
    return Array.isArray(body.points) ? body.points : [body.points];
  }
  return [];
};

// POST create slide
router.post('/', uploadOnboarding.single('image'), async (req, res) => {
  try {
    const { title, order } = req.body;
    const points = parsePoints(req.body);

    // Convert absolute path to relative path for mobile app compatibility
    let imagePath = null;
    if (req.file) {
      if (req.file.secure_url || req.file.url) {
        // If using cloud storage (Cloudinary, etc.)
        imagePath = req.file.secure_url || req.file.url;
      } else if (req.file.path) {
        // Convert absolute path to relative path
        const path = require('path');
        const uploadsIndex = req.file.path.indexOf('uploads');
        imagePath = uploadsIndex !== -1 ? req.file.path.substring(uploadsIndex).replace(/\\/g, '/') : req.file.path;
      }
    }

    const slide = new OnboardingSlide({
      title,
      points,
      order: order ? Number(order) : 0,
      image: imagePath,
    });

    const saved = await slide.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update slide
router.put('/:id', uploadOnboarding.single('image'), async (req, res) => {
  try {
    const { title, order } = req.body;
    const points = parsePoints(req.body);

    const updates = { title, points };
    if (order !== undefined) updates.order = Number(order) || 0;
    
    if (req.file) {
      // Convert absolute path to relative path for mobile app compatibility
      if (req.file.secure_url || req.file.url) {
        // If using cloud storage (Cloudinary, etc.)
        updates.image = req.file.secure_url || req.file.url;
      } else if (req.file.path) {
        // Convert absolute path to relative path
        const path = require('path');
        const uploadsIndex = req.file.path.indexOf('uploads');
        updates.image = uploadsIndex !== -1 ? req.file.path.substring(uploadsIndex).replace(/\\/g, '/') : req.file.path;
      }
    }

    const slide = await OnboardingSlide.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE slide
router.delete('/:id', async (req, res) => {
  try {
    const slide = await OnboardingSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json({ message: 'Slide deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
