const BeltName = require('../models/BeltName');

exports.getAll = async (req, res) => {
  try {
    const names = await BeltName.find().sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: names });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const name = await BeltName.create(req.body);
    res.status(201).json({ status: 'success', data: name });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const name = await BeltName.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!name) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: name });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const name = await BeltName.findByIdAndDelete(req.params.id);
    if (!name) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
