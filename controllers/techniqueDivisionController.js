const TechniqueDivision = require('../models/TechniqueDivision');

exports.getAll = async (req, res) => {
  try {
    const data = await TechniqueDivision.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await TechniqueDivision.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = parseBody(req.body);
    const item = await TechniqueDivision.create(body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = parseBody(req.body);
    const item = await TechniqueDivision.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await TechniqueDivision.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

function parseBody(raw) {
  const body = { ...raw };
  ['headings', 'points'].forEach(key => {
    if (typeof body[key] === 'string') {
      try { body[key] = JSON.parse(body[key]); } catch { body[key] = []; }
    }
  });
  return body;
}
