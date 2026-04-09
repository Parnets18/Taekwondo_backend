const Pattern = require('../models/Pattern');
const path = require('path');

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
    res.status(400).json({ status: 'error', message: err.message });
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

// ── Tab items CRUD ────────────────────────────────────────────────────────────
exports.addItem = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ status: 'error', message: 'Pattern not found' });
    const itemBody = parseItemBody(req.body, req.files);
    pattern.items.push(itemBody);
    await pattern.save();
    res.status(201).json({ status: 'success', data: pattern });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ status: 'error', message: 'Pattern not found' });
    const idx = pattern.items.findIndex(i => i._id.toString() === req.params.itemId);
    if (idx === -1) return res.status(404).json({ status: 'error', message: 'Item not found' });
    const itemBody = parseItemBody(req.body, req.files, pattern.items[idx]);
    pattern.items[idx] = { ...pattern.items[idx].toObject(), ...itemBody };
    await pattern.save();
    res.json({ status: 'success', data: pattern });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ status: 'error', message: 'Pattern not found' });
    pattern.items = pattern.items.filter(i => i._id.toString() !== req.params.itemId);
    await pattern.save();
    res.json({ status: 'success', data: pattern });
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

function parseItemBody(raw, files, existing = {}) {
  const body = { ...raw };
  ['points', 'headings', 'techniques', 'techPoints', 'ntPoints'].forEach(k => {
    if (typeof body[k] === 'string') {
      try { body[k] = JSON.parse(body[k]); } catch { body[k] = []; }
    }
  });
  if (files?.diagram?.[0]) {
    body.diagram = `/uploads/patterns/${files.diagram[0].filename}`;
  } else if (!body.diagram && existing.diagram) {
    body.diagram = existing.diagram;
  }
  if (files?.descDiagram?.[0]) {
    body.descDiagram = `/uploads/patterns/${files.descDiagram[0].filename}`;
  } else if (!body.descDiagram && existing.descDiagram) {
    body.descDiagram = existing.descDiagram;
  }
  return body;
}
