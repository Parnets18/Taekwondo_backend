const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getPrograms, getProgram, createProgram, updateProgram, deleteProgram,
  getProgramExercises, getProgramExercise, createProgramExercise, updateProgramExercise, deleteProgramExercise,
} = require('../controllers/programController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'programs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `program-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// ── Program Exercises (must be before /:id to avoid route conflict) ──────────
router.get('/exercises/all', getProgramExercises);
router.get('/exercises/:id', getProgramExercise);
router.post('/exercises', protect, adminOnly, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createProgramExercise);
router.put('/exercises/:id', protect, adminOnly, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateProgramExercise);
router.delete('/exercises/:id', protect, adminOnly, deleteProgramExercise);

// ── Programs (public GET, admin write) ───────────────────────────────────────
router.get('/', getPrograms);
router.get('/:id', getProgram);
router.post('/', protect, adminOnly, upload.single('image'), createProgram);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProgram);
router.delete('/:id', protect, adminOnly, deleteProgram);

module.exports = router;
