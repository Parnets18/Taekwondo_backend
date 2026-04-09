const BodyPart = require('../models/BodyPart');

const extractImages = (req, body) => {
  if (!req.files) return;
  if (req.files.image?.[0]) body.image = `/uploads/body-parts/${req.files.image[0].filename}`;
  if (req.files.images?.length) {
    const existing = body.existingImages ? JSON.parse(body.existingImages) : [];
    const newImgs = req.files.images.map(f => `/uploads/body-parts/${f.filename}`);
    body.images = [...existing, ...newImgs];
  } else if (body.existingImages) {
    body.images = JSON.parse(body.existingImages);
  }
  delete body.existingImages;
  // Parse JSON fields
  if (body.directions && typeof body.directions === 'string') body.directions = JSON.parse(body.directions);
  if (body.parts && typeof body.parts === 'string') body.parts = JSON.parse(body.parts);
  if (body.points && typeof body.points === 'string') body.points = JSON.parse(body.points);
};

exports.getBodyParts = async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const items = await BodyPart.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: items });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createBodyPart = async (req, res) => {
  try {
    const body = { ...req.body };
    extractImages(req, body);
    const item = await BodyPart.create(body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateBodyPart = async (req, res) => {
  try {
    const body = { ...req.body };
    extractImages(req, body);
    const item = await BodyPart.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deleteBodyPart = async (req, res) => {
  try {
    const item = await BodyPart.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
