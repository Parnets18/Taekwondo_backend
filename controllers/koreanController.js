const Korean = require('../models/Korean');

exports.getKorean = async (req, res) => {
  try {
    const items = await Korean.find().sort({ section: 1, order: 1, createdAt: 1 });
    res.json({ status: 'success', data: items });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createKorean = async (req, res) => {
  try {
    const item = await Korean.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.updateKorean = async (req, res) => {
  try {
    const item = await Korean.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.deleteKorean = async (req, res) => {
  try {
    const item = await Korean.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
