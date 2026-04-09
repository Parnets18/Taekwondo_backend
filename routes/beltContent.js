const express = require('express');
const router = express.Router();
const { getBeltContents, getBeltContent, createBeltContent, updateBeltContent, deleteBeltImage } = require('../controllers/beltContentController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'belt-content');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `belt-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Public
router.get('/', getBeltContents);
router.get('/:id', getBeltContent);

// Admin protected
router.post('/', protect, adminOnly, upload.single('image'), createBeltContent);
router.put('/:id', protect, adminOnly, upload.single('image'), updateBeltContent);
router.delete('/:id/image', protect, adminOnly, deleteBeltImage);
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const BeltContent = require('../models/BeltContent');
    const belt = await BeltContent.findByIdAndDelete(req.params.id);
    if (!belt) return res.status(404).json({ status: 'error', message: 'Belt not found' });
    res.json({ status: 'success', message: 'Belt deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
