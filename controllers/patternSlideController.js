const PatternSlide = require('../models/PatternSlide');

exports.getAll = async (req, res) => {
  try {
    const filter = req.query.slide ? { slide: req.query.slide } : {};
    const data = await PatternSlide.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const item = await PatternSlide.create(body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const item = await PatternSlide.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const item = await PatternSlide.findByIdAndUpdate(
      req.params.id,
      { $set: { order: Number(req.body.order) } },
      { new: true }
    );
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await PatternSlide.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

function parseBody(raw, files) {
  const body = { ...raw };
  ['headings', 'points'].forEach(k => {
    if (typeof body[k] === 'string') {
      try { body[k] = JSON.parse(body[k]); } catch { body[k] = []; }
    }
  });
  if (files?.images?.length) {
    const existing = body.existingImages ? JSON.parse(body.existingImages) : [];
    const newImgs = files.images.map(f => `/uploads/pattern-slides/${f.filename}`);
    body.images = [...existing, ...newImgs];
  } else if (body.existingImages) {
    body.images = JSON.parse(body.existingImages);
  }
  delete body.existingImages;
  return body;
}
