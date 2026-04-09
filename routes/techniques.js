const express = require('express');
const router = express.Router();
const Technique = require('../models/Technique');
const TechniqueCategory = require('../models/TechniqueCategory');
const { uploadTechnique } = require('../config/upload');

const upload = uploadTechnique.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

const parseArray = (body, key) => {
  const val = body[key] ?? body[`${key}[]`];
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

// ── CATEGORIES ──────────────────────────────────────────────

router.get('/categories', async (req, res) => {
  try {
    const cats = await TechniqueCategory.find().sort({ createdAt: 1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/categories', async (req, res) => {
  try {
    const cat = new TechniqueCategory({ name: req.body.name });
    const saved = await cat.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const cat = await TechniqueCategory.findByIdAndUpdate(
      req.params.id, { name: req.body.name }, { new: true }
    );
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(cat);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const cat = await TechniqueCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    // Delete all techniques in this category
    await Technique.deleteMany({ category: cat.name });
    await cat.deleteOne();
    res.json({ message: 'Category and its techniques deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── TECHNIQUES ───────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const techniques = await Technique.find(filter).sort({ category: 1, createdAt: 1 });
    res.json(techniques);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const tech = await Technique.findById(req.params.id);
    if (!tech) return res.status(404).json({ message: 'Technique not found' });
    res.json(tech);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', upload, async (req, res) => {
  try {
    const { name, category, difficulty } = req.body;
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];
    const tech = new Technique({
      name, category,
      difficulty: difficulty || 'Easy',
      videoUrl: videoFile ? (videoFile.path || videoFile.secure_url || videoFile.url) : '',
      steps: parseArray(req.body, 'steps'),
      tips: parseArray(req.body, 'tips'),
      image: imageFile ? (imageFile.path || imageFile.secure_url || imageFile.url) : null,
    });
    const saved = await tech.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', upload, async (req, res) => {
  try {
    const { name, category, difficulty } = req.body;
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];
    const updates = {
      name, category,
      difficulty: difficulty || 'Easy',
      steps: parseArray(req.body, 'steps'),
      tips: parseArray(req.body, 'tips'),
    };
    if (imageFile) updates.image = imageFile.path || imageFile.secure_url || imageFile.url;
    if (videoFile) updates.videoUrl = videoFile.path || videoFile.secure_url || videoFile.url;

    const tech = await Technique.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!tech) return res.status(404).json({ message: 'Technique not found' });
    res.json(tech);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const tech = await Technique.findByIdAndDelete(req.params.id);
    if (!tech) return res.status(404).json({ message: 'Technique not found' });
    res.json({ message: 'Technique deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
