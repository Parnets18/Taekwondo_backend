const Entry = require('../models/Entry');
const Pattern = require('../models/Pattern');

// Get all entries for a specific pattern
exports.getByPattern = async (req, res) => {
  try {
    const entries = await Entry.find({ patternId: req.params.patternId })
      .sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: entries });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get a single entry
exports.getById = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ status: 'error', message: 'Entry not found' });
    res.json({ status: 'success', data: entry });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Create a new entry for a pattern
exports.create = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.patternId);
    if (!pattern) return res.status(404).json({ status: 'error', message: 'Pattern not found' });

    const body = parseEntryBody(req.body, req.files);
    body.patternId = req.params.patternId;
    body.patternName = pattern.name;

    const entry = await Entry.create(body);
    res.status(201).json({ status: 'success', data: entry });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Update an entry
exports.update = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) return res.status(404).json({ status: 'error', message: 'Entry not found' });

    const body = parseEntryBody(req.body, req.files, entry);
    const updated = await Entry.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    res.json({ status: 'success', data: updated });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Delete an entry
exports.remove = async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ status: 'error', message: 'Entry not found' });
    res.json({ status: 'success', message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Update entry order
exports.updateOrder = async (req, res) => {
  try {
    const entry = await Entry.findByIdAndUpdate(
      req.params.id,
      { $set: { order: Number(req.body.order) } },
      { new: true }
    );
    if (!entry) return res.status(404).json({ status: 'error', message: 'Entry not found' });
    res.json({ status: 'success', data: entry });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

function parseEntryBody(raw, files, existing = {}) {
  const body = { ...raw };
  
  // Parse JSON fields
  ['points', 'headings', 'techniques', 'techPoints', 'ntPoints'].forEach(k => {
    if (typeof body[k] === 'string') {
      try { body[k] = JSON.parse(body[k]); } catch { body[k] = []; }
    }
  });

  // Handle diagram uploads
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
