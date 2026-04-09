const InstructorTitle = require('../models/InstructorTitle');

exports.getAll = async (req, res) => {
  try {
    const filter = req.query.tab ? { tab: req.query.tab } : {};
    const data = await InstructorTitle.find(filter).sort({ order: 1, createdAt: 1 });
    // Ensure numeric sort in case order was stored as string
    data.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    res.json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getTabs = async (req, res) => {
  try {
    const tabs = await InstructorTitle.distinct('tab');
    res.json({ status: 'success', data: tabs });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const item = await InstructorTitle.create(body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = parseBody(req.body, req.files);
    const item = await InstructorTitle.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await InstructorTitle.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

function parseBody(raw, files) {
  const body = { ...raw };
  // Cast order to number
  if (body.order !== undefined) body.order = Number(body.order);
  ['headings', 'points'].forEach(key => {
    if (typeof body[key] === 'string') {
      try { body[key] = JSON.parse(body[key]); } catch { body[key] = []; }
    }
  });
  // Handle per-image name + file
  if (body.imageMeta) {
    let meta = [];
    try { meta = JSON.parse(body.imageMeta); } catch { meta = []; }
    body.images = meta.map((m, i) => {
      const fieldName = `imageFile_${i}`;
      if (files?.[fieldName]?.[0]) {
        return { path: `/uploads/instructor-titles/${files[fieldName][0].filename}`, name: m.name || '' };
      }
      return { path: m.path || '', name: m.name || '' };
    }).filter(img => img.path);
    delete body.imageMeta;
  }
  return body;
}
