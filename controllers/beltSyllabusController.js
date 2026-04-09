const BeltSyllabus = require('../models/BeltSyllabus');

const parseBody = (req) => {
  const body = { ...req.body };
  if (body.patterns && typeof body.patterns === 'string') {
    try { body.patterns = JSON.parse(body.patterns); } catch (_) {}
  }
  if (body.fundamentalMoves && typeof body.fundamentalMoves === 'string') {
    try { body.fundamentalMoves = JSON.parse(body.fundamentalMoves); } catch (_) {}
  }
  if (body.extraSections && typeof body.extraSections === 'string') {
    try { body.extraSections = JSON.parse(body.extraSections); } catch (_) {}
  }
  // Attach uploaded diagram images: field name = diagramImage_<patternIndex>
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    files.forEach(f => {
      const m = f.fieldname.match(/^diagramImage_(\d+)$/);
      if (m && body.patterns?.[m[1]]) {
        body.patterns[m[1]].diagramImage = `/uploads/theory/${f.filename}`;
      }
    });
  }
  return body;
};

exports.getAll = async (req, res) => {
  try {
    const belts = await BeltSyllabus.find().sort({ createdAt: 1 });
    res.json({ status: 'success', data: belts });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const belt = await BeltSyllabus.findById(req.params.id);
    if (!belt) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: belt });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = parseBody(req);
    const belt = await BeltSyllabus.create(body);
    res.status(201).json({ status: 'success', data: belt });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = parseBody(req);
    const belt = await BeltSyllabus.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!belt) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: belt });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const belt = await BeltSyllabus.findByIdAndDelete(req.params.id);
    if (!belt) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
