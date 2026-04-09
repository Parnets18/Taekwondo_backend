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

    const slide = new OnboardingSlide({
      title,
      points,
      order: order ? Number(order) : 0,
      image: req.file ? (req.file.path || req.file.secure_url || req.file.url) : null,
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
    if (req.file) updates.image = req.file.path || req.file.secure_url || req.file.url;

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
