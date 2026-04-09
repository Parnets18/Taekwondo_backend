const express = require('express');
const router = express.Router();
const { getAll, getTabs, create, update, remove } = require('../controllers/instructorTitleController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Local storage for instructor title images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'instructor-titles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })
  .fields(Array.from({ length: 20 }, (_, i) => ({ name: `imageFile_${i}`, maxCount: 1 })));

router.get('/tabs',   getTabs);
router.get('/',       getAll);
router.post('/',      protect, authorize('admin'), upload, create);
router.patch('/:id/order', protect, authorize('admin'), async (req, res) => {
  try {
    const InstructorTitle = require('../models/InstructorTitle');
    const { order } = req.body;
    console.log(`PATCH order: id=${req.params.id}, order=${order}`);
    const item = await InstructorTitle.findByIdAndUpdate(
      req.params.id,
      { $set: { order: Number(order) } },
      { new: true }
    );
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    console.error('PATCH order error:', err);
    res.status(400).json({ status: 'error', message: err.message });
  }
});
router.put('/:id',    protect, authorize('admin'), upload, update);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;
