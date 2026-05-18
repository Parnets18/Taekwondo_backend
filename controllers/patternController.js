const Pattern = require('../models/Pattern');

exports.getAll = async (req, res) => {
  try {
    const data = await Pattern.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Pattern.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const item = await Pattern.create(body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const item = await Pattern.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const item = await Pattern.findByIdAndUpdate(
      req.params.id,
      { $set: { order: Number(req.body.order) } },
      { new: true }
    );
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Pattern.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

function parseBody(raw, files) {
  const body = { ...raw };
  if (files?.image?.[0]) {
    body.image = `/uploads/patterns/${files.image[0].filename}`;
  }
  // preserve existing image if no new file uploaded and existingImage sent
  if (!files?.image?.[0] && body.existingImage) {
    body.image = body.existingImage;
  }
  delete body.existingImage;
  return body;
}
