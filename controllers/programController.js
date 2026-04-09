const Program = require('../models/Program');
const ProgramExercise = require('../models/ProgramExercise');
const fs = require('fs');
const path = require('path');

// ── Programs ──────────────────────────────────────────────────────────────────

const getPrograms = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const programs = await Program.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ status: 'success', data: { programs } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ status: 'error', message: 'Program not found' });
    res.json({ status: 'success', data: { program } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createProgram = async (req, res) => {
  try {
    const { title, category } = req.body;
    const image = req.file ? `uploads/programs/${req.file.filename}` : null;
    const program = new Program({ title, category, image });
    const saved = await program.save();
    res.status(201).json({ status: 'success', data: { program: saved } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

const updateProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ status: 'error', message: 'Program not found' });

    const fields = ['title', 'category', 'isActive'];
    fields.forEach(f => { if (req.body[f] !== undefined) program[f] = req.body[f]; });

    if (req.file) {
      if (program.image) {
        const old = path.join(__dirname, '..', program.image);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      program.image = `uploads/programs/${req.file.filename}`;
    }

    const updated = await program.save();
    res.json({ status: 'success', data: { program: updated } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ status: 'error', message: 'Program not found' });
    if (program.image) {
      const imgPath = path.join(__dirname, '..', program.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    res.json({ status: 'success', message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ── Program Exercises ─────────────────────────────────────────────────────────

const getProgramExercises = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.programId) filter.programId = req.query.programId;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.equipment) filter.equipment = req.query.equipment;
    if (req.query.level) filter.level = req.query.level;
    const exercises = await ProgramExercise.find(filter).sort({ createdAt: 1 });
    res.json({ status: 'success', data: { exercises } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getProgramExercise = async (req, res) => {
  try {
    const exercise = await ProgramExercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ status: 'error', message: 'Exercise not found' });
    res.json({ status: 'success', data: { exercise } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createProgramExercise = async (req, res) => {
  try {
    const { name, section, equipment, level, programId, programTitle } = req.body;
    const steps = req.body.stepsJson ? JSON.parse(req.body.stepsJson) : [];
    const tips = req.body.tipsJson ? JSON.parse(req.body.tipsJson) : [];
    const image = req.files?.image?.[0] ? `uploads/programs/${req.files.image[0].filename}` : null;
    const videoUrl = req.files?.video?.[0] ? `uploads/programs/${req.files.video[0].filename}` : null;
    const exercise = new ProgramExercise({
      name, section, equipment, level: level || 'Easy',
      programId: programId || null, programTitle: programTitle || '',
      image, videoUrl, steps, tips,
    });
    const saved = await exercise.save();
    res.status(201).json({ status: 'success', data: { exercise: saved } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

const updateProgramExercise = async (req, res) => {
  try {
    const exercise = await ProgramExercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ status: 'error', message: 'Exercise not found' });

    const fields = ['name', 'section', 'equipment', 'level', 'programId', 'programTitle', 'isActive'];
    fields.forEach(f => { if (req.body[f] !== undefined) exercise[f] = req.body[f]; });
    if (req.body.stepsJson !== undefined) exercise.steps = JSON.parse(req.body.stepsJson);
    if (req.body.tipsJson !== undefined) exercise.tips = JSON.parse(req.body.tipsJson);

    if (req.files?.image?.[0]) {
      if (exercise.image) { const old = path.join(__dirname, '..', exercise.image); if (fs.existsSync(old)) fs.unlinkSync(old); }
      exercise.image = `uploads/programs/${req.files.image[0].filename}`;
    }
    if (req.files?.video?.[0]) {
      if (exercise.videoUrl) { const old = path.join(__dirname, '..', exercise.videoUrl); if (fs.existsSync(old)) fs.unlinkSync(old); }
      exercise.videoUrl = `uploads/programs/${req.files.video[0].filename}`;
    }

    const updated = await exercise.save();
    res.json({ status: 'success', data: { exercise: updated } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

const deleteProgramExercise = async (req, res) => {
  try {
    const exercise = await ProgramExercise.findByIdAndDelete(req.params.id);
    if (!exercise) return res.status(404).json({ status: 'error', message: 'Exercise not found' });
    if (exercise.image) { const p = path.join(__dirname, '..', exercise.image); if (fs.existsSync(p)) fs.unlinkSync(p); }
    if (exercise.videoUrl) { const p = path.join(__dirname, '..', exercise.videoUrl); if (fs.existsSync(p)) fs.unlinkSync(p); }
    res.json({ status: 'success', message: 'Exercise deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getPrograms, getProgram, createProgram, updateProgram, deleteProgram,
  getProgramExercises, getProgramExercise, createProgramExercise, updateProgramExercise, deleteProgramExercise,
};
