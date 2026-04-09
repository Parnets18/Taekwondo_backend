const MoralCulture = require('../models/MoralCulture');

const extractImages = (req, body) => {
  if (!req.files) return;
  if (req.files.images?.length) {
    const existing = body.existingImages ? JSON.parse(body.existingImages) : [];
    const newImgs = req.files.images.map(f => `/uploads/moral-culture/${f.filename}`);
    body.images = [...existing, ...newImgs];
  } else if (body.existingImages) {
    body.images = JSON.parse(body.existingImages);
  }
  delete body.existingImages;
  if (body.points && typeof body.points === 'string') body.points = JSON.parse(body.points);
};

exports.getAll = async (req, res) => {
  try {
    const items = await MoralCulture.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: items });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = { ...req.body };
    extractImages(req, body);
    const item = await MoralCulture.create(body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = { ...req.body };
    extractImages(req, body);
    const item = await MoralCulture.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await MoralCulture.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
