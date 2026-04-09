const BeltContent = require('../models/BeltContent');
const fs = require('fs');
const path = require('path');

// GET all belt content (public)
const getBeltContents = async (req, res) => {
  try {
    const belts = await BeltContent.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: { belts } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET single
const getBeltContent = async (req, res) => {
  try {
    const belt = await BeltContent.findById(req.params.id);
    if (!belt) return res.status(404).json({ status: 'error', message: 'Belt not found' });
    res.json({ status: 'success', data: { belt } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// CREATE
const createBeltContent = async (req, res) => {
  try {
    const { beltName } = req.body;
    const image = req.file ? `uploads/belt-content/${req.file.filename}` : null;
    const belt = new BeltContent({ beltName, image });
    const saved = await belt.save();
    res.status(201).json({ status: 'success', data: { belt: saved } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// UPDATE
const updateBeltContent = async (req, res) => {
  try {
    const { beltName, isActive } = req.body;
    const belt = await BeltContent.findById(req.params.id);
    if (!belt) return res.status(404).json({ status: 'error', message: 'Belt not found' });

    if (beltName !== undefined) belt.beltName = beltName;
    if (isActive !== undefined) belt.isActive = isActive;

    if (req.file) {
      // Delete old image
      if (belt.image) {
        const oldPath = path.join(__dirname, '..', belt.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      belt.image = `uploads/belt-content/${req.file.filename}`;
    }

    const updated = await belt.save();
    res.json({ status: 'success', data: { belt: updated } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// DELETE image only
const deleteBeltImage = async (req, res) => {
  try {
    const belt = await BeltContent.findById(req.params.id);
    if (!belt) return res.status(404).json({ status: 'error', message: 'Belt not found' });

    if (belt.image) {
      const imgPath = path.join(__dirname, '..', belt.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      belt.image = null;
      await belt.save();
    }
    res.json({ status: 'success', message: 'Image removed' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = { getBeltContents, getBeltContent, createBeltContent, updateBeltContent, deleteBeltImage };
