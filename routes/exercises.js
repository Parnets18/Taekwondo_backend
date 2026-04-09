const express = require('express');
const router = express.Router();
const { getExercises, getExercise, createExercise, updateExercise, deleteExercise } = require('../controllers/exerciseController');
const { protect, adminOnly } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'exercises');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `exercise-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos
});

// Public
router.get('/', getExercises);
router.get('/:id', getExercise);

// Admin protected
router.post('/', protect, adminOnly, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createExercise);
router.put('/:id', protect, adminOnly, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateExercise);
router.delete('/:id', protect, adminOnly, deleteExercise);

module.exports = router;
