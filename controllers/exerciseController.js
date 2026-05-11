const Exercise = require('../models/Exercise');
const fs = require('fs');
const path = require('path');

// GET all (public) — optional ?section= filter
const getExercises = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.section) filter.section = req.query.section;
    if (req.query.equipment) filter.equipment = req.query.equipment;
    if (req.query.beltId) filter.beltId = req.query.beltId;
    const exercises = await Exercise.find(filter).sort({ createdAt: 1 });
    res.json({ status: 'success', data: { exercises } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET single
const getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ status: 'error', message: 'Exercise not found' });
    res.json({ status: 'success', data: { exercise } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// CREATE
const createExercise = async (req, res) => {
  try {
    const { name, section, equipment, duration, beltId } = req.body;
    const steps = req.body.stepsJson ? JSON.parse(req.body.stepsJson) : [];
    const tips = req.body.tipsJson ? JSON.parse(req.body.tipsJson) : [];
    const level = req.body.levelJson ? JSON.parse(req.body.levelJson) : [];
    const beltNames = req.body.beltNamesJson ? JSON.parse(req.body.beltNamesJson) : [];
    const beltName = beltNames[0] || req.body.beltName || '';
    const image = req.files?.image?.[0] ? `uploads/exercises/${req.files.image[0].filename}` : null;
    const videoUrl = req.files?.video?.[0] ? `uploads/exercises/${req.files.video[0].filename}` : null;
    const exercise = new Exercise({ name, section, equipment, level, duration, beltId: beltId || null, beltName, beltNames, image, videoUrl, steps, tips });
    const saved = await exercise.save();
    res.status(201).json({ status: 'success', data: { exercise: saved } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// UPDATE
const updateExercise = async (req, res) => {
  try {
    const { name, section, equipment, duration, isActive } = req.body;
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ status: 'error', message: 'Exercise not found' });

    if (name !== undefined) exercise.name = name;
    if (section !== undefined) exercise.section = section;
    if (equipment !== undefined) exercise.equipment = equipment;
    if (req.body.levelJson !== undefined) {
      exercise.level = JSON.parse(req.body.levelJson);
      exercise.markModified('level');
    } else if (req.body.level !== undefined) {
      exercise.level = Array.isArray(req.body.level) ? req.body.level : [req.body.level];
      exercise.markModified('level');
    }
    if (req.body.beltNamesJson !== undefined) {
      const beltNames = JSON.parse(req.body.beltNamesJson);
      exercise.beltNames = beltNames;
      exercise.beltName = beltNames[0] || '';
      exercise.markModified('beltNames');
    } else if (req.body.beltName !== undefined) {
      exercise.beltName = req.body.beltName;
    }
    if (duration !== undefined) exercise.duration = duration;
    if (isActive !== undefined) exercise.isActive = isActive;
    if (req.body.beltName !== undefined) exercise.beltName = req.body.beltName;
    if (req.body.beltId !== undefined) exercise.beltId = req.body.beltId || null;
    if (req.body.videoUrl !== undefined) exercise.videoUrl = req.body.videoUrl;
    if (req.body.stepsJson !== undefined) exercise.steps = JSON.parse(req.body.stepsJson);
    if (req.body.tipsJson !== undefined) exercise.tips = JSON.parse(req.body.tipsJson);

    if (req.files?.image?.[0]) {
      if (exercise.image) { const old = path.join(__dirname, '..', exercise.image); if (fs.existsSync(old)) fs.unlinkSync(old); }
      exercise.image = `uploads/exercises/${req.files.image[0].filename}`;
    }
    if (req.files?.video?.[0]) {
      if (exercise.videoUrl) { const old = path.join(__dirname, '..', exercise.videoUrl); if (fs.existsSync(old)) fs.unlinkSync(old); }
      exercise.videoUrl = `uploads/exercises/${req.files.video[0].filename}`;
    }

    const updated = await exercise.save();
    res.json({ status: 'success', data: { exercise: updated } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// DELETE
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) return res.status(404).json({ status: 'error', message: 'Exercise not found' });
    if (exercise.image) {
      const imgPath = path.join(__dirname, '..', exercise.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    res.json({ status: 'success', message: 'Exercise deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = { getExercises, getExercise, createExercise, updateExercise, deleteExercise };
