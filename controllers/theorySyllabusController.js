const Tenet = require('../models/Tenet');
const Dynasty = require('../models/Dynasty');
const TheoryOfPower = require('../models/TheoryOfPower');
const HistorySection = require('../models/HistorySection');
const BasicTheoryContent = require('../models/BasicTheoryContent');

// ─── TENETS ───────────────────────────────────────────────────────────────────

exports.getTenets = async (req, res) => {
  try {
    const tenets = await Tenet.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: tenets });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createTenet = async (req, res) => {
  try {
    const tenet = await Tenet.create(req.body);
    res.status(201).json({ status: 'success', data: tenet });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateTenet = async (req, res) => {
  try {
    const tenet = await Tenet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tenet) return res.status(404).json({ status: 'error', message: 'Tenet not found' });
    res.json({ status: 'success', data: tenet });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deleteTenet = async (req, res) => {
  try {
    const tenet = await Tenet.findByIdAndDelete(req.params.id);
    if (!tenet) return res.status(404).json({ status: 'error', message: 'Tenet not found' });
    res.json({ status: 'success', message: 'Tenet deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── DYNASTIES ────────────────────────────────────────────────────────────────

exports.getDynasties = async (req, res) => {
  try {
    const dynasties = await Dynasty.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: dynasties });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createDynasty = async (req, res) => {
  try {
    const dynasty = await Dynasty.create(req.body);
    res.status(201).json({ status: 'success', data: dynasty });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateDynasty = async (req, res) => {
  try {
    const dynasty = await Dynasty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dynasty) return res.status(404).json({ status: 'error', message: 'Dynasty not found' });
    res.json({ status: 'success', data: dynasty });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deleteDynasty = async (req, res) => {
  try {
    const dynasty = await Dynasty.findByIdAndDelete(req.params.id);
    if (!dynasty) return res.status(404).json({ status: 'error', message: 'Dynasty not found' });
    res.json({ status: 'success', message: 'Dynasty deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── THEORY OF POWER ──────────────────────────────────────────────────────────

exports.getPowerItems = async (req, res) => {
  try {
    const items = await TheoryOfPower.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: items });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createPowerItem = async (req, res) => {
  try {
    const item = await TheoryOfPower.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updatePowerItem = async (req, res) => {
  try {
    const item = await TheoryOfPower.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deletePowerItem = async (req, res) => {
  try {
    const item = await TheoryOfPower.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });
    res.json({ status: 'success', message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── HISTORY SECTIONS ─────────────────────────────────────────────────────────

exports.getHistorySections = async (req, res) => {
  try {
    const sections = await HistorySection.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: sections });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createHistorySection = async (req, res) => {
  try {
    const { period, description, order } = req.body;
    const section = await HistorySection.create({ period, description, order });
    res.status(201).json({ status: 'success', data: section });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateHistorySection = async (req, res) => {
  try {
    const { period, description, order } = req.body;
    const section = await HistorySection.findByIdAndUpdate(
      req.params.id, { period, description, order }, { new: true, runValidators: true }
    );
    if (!section) return res.status(404).json({ status: 'error', message: 'Section not found' });
    res.json({ status: 'success', data: section });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deleteHistorySection = async (req, res) => {
  try {
    const section = await HistorySection.findByIdAndDelete(req.params.id);
    if (!section) return res.status(404).json({ status: 'error', message: 'Section not found' });
    res.json({ status: 'success', message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── BASIC THEORY CONTENT ─────────────────────────────────────────────────────

exports.getBasicTheoryContent = async (req, res) => {
  try {
    const items = await BasicTheoryContent.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: items });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createBasicTheoryContent = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.points && typeof body.points === 'string') {
      try { body.points = JSON.parse(body.points); } catch (_) {}
    }
    if (body.fullDetails && typeof body.fullDetails === 'string') {
      try { body.fullDetails = JSON.parse(body.fullDetails); } catch (_) {}
    }
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      files.forEach(f => {
        if (f.fieldname === 'image') body.image = `/uploads/theory/${f.filename}`;
        // point detail section images: pointDetail_pi_si
        const m = f.fieldname.match(/^pointDetail_(\d+)_(\d+)$/);
        if (m && body.points?.[m[1]]?.details?.[m[2]]) {
          body.points[m[1]].details[m[2]].image = `/uploads/theory/${f.filename}`;
        }
        // fullDetails section images: fullDetail_si
        const fm = f.fieldname.match(/^fullDetail_(\d+)$/);
        if (fm && body.fullDetails?.[fm[1]]) {
          body.fullDetails[fm[1]].image = `/uploads/theory/${f.filename}`;
        }
      });
    }
    const item = await BasicTheoryContent.create(body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateBasicTheoryContent = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.points && typeof body.points === 'string') {
      try { body.points = JSON.parse(body.points); } catch (_) {}
    }
    if (body.fullDetails && typeof body.fullDetails === 'string') {
      try { body.fullDetails = JSON.parse(body.fullDetails); } catch (_) {}
    }
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      files.forEach(f => {
        if (f.fieldname === 'image') body.image = `/uploads/theory/${f.filename}`;
        const m = f.fieldname.match(/^pointDetail_(\d+)_(\d+)$/);
        if (m && body.points?.[m[1]]?.details?.[m[2]]) {
          body.points[m[1]].details[m[2]].image = `/uploads/theory/${f.filename}`;
        }
        const fm = f.fieldname.match(/^fullDetail_(\d+)$/);
        if (fm && body.fullDetails?.[fm[1]]) {
          body.fullDetails[fm[1]].image = `/uploads/theory/${f.filename}`;
        }
      });
    }
    const item = await BasicTheoryContent.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deleteBasicTheoryContent = async (req, res) => {
  try {
    const item = await BasicTheoryContent.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
