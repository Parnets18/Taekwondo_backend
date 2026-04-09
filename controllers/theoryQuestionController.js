const TheoryQuestion = require('../models/TheoryQuestion');

// GET /api/theory-questions  (public - used by mobile app)
exports.getAll = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.beltLevel) filter.beltLevel = req.query.beltLevel;
    const items = await TheoryQuestion.find(filter).sort({ beltLevel: 1, order: 1 });
    res.json({ status: 'success', data: items });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/theory-questions/admin  (admin - includes inactive)
exports.getAllAdmin = async (req, res) => {
  try {
    const filter = {};
    if (req.query.beltLevel) filter.beltLevel = req.query.beltLevel;
    const items = await TheoryQuestion.find(filter).sort({ beltLevel: 1, order: 1 });
    res.json({ status: 'success', data: items });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/theory-questions
exports.create = async (req, res) => {
  try {
    const item = await TheoryQuestion.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PUT /api/theory-questions/:id
exports.update = async (req, res) => {
  try {
    const item = await TheoryQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/theory-questions/:id
exports.remove = async (req, res) => {
  try {
    await TheoryQuestion.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/theory-questions/bulk  (seed / bulk import)
exports.bulkCreate = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ status: 'error', message: 'questions array required' });
    const result = await TheoryQuestion.insertMany(questions, { ordered: false });
    res.status(201).json({ status: 'success', inserted: result.length });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
