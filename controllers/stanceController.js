const Stance = require('../models/Stance');

const extractImages = (req, body) => {
  if (!req.files) return;
  if (req.files.diagramImage?.[0]) body.diagramImage = `/uploads/stances/${req.files.diagramImage[0].filename}`;
  if (req.files.personImages?.length) {
    const existing = body.existingPersonImages ? JSON.parse(body.existingPersonImages) : [];
    const newImages = req.files.personImages.map(f => `/uploads/stances/${f.filename}`);
    body.personImages = [...existing, ...newImages];
  } else if (body.existingPersonImages) {
    body.personImages = JSON.parse(body.existingPersonImages);
  }
  delete body.existingPersonImages;
};

exports.getStances = async (req, res) => {
  try {
    const stances = await Stance.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: stances });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createStance = async (req, res) => {
  try {
    const body = { ...req.body };
    extractImages(req, body);
    const stance = await Stance.create(body);
    res.status(201).json({ status: 'success', data: stance });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateStance = async (req, res) => {
  try {
    const body = { ...req.body };
    extractImages(req, body);
    const stance = await Stance.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!stance) return res.status(404).json({ status: 'error', message: 'Stance not found' });
    res.json({ status: 'success', data: stance });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deleteStance = async (req, res) => {
  try {
    const stance = await Stance.findByIdAndDelete(req.params.id);
    if (!stance) return res.status(404).json({ status: 'error', message: 'Stance not found' });
    res.json({ status: 'success', message: 'Stance deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
