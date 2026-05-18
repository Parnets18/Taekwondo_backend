const Exercise = require('../models/Exercise');
const fs = require('fs');
const path = require('path');

// GET all (public) — optional filters
const getExercises = async (req, res) => {
  try {
    const Technique = require('../models/Technique');
    const { section, equipment, beltId, beltName } = req.query;

    // Helper: build belt match for both legacy and array fields
    const beltMatch = beltName
      ? { $or: [{ beltName }, { beltNames: beltName }] }
      : beltId
        ? { $or: [{ beltId }, { beltNames: { $exists: true, $not: { $size: 0 } } }] }
        : {};

    // 1. Exercise model (warmUp / stretching)
    const exFilter = { isActive: true, ...beltMatch };
    if (section) exFilter.section = section;
    if (equipment) exFilter.equipment = equipment;
    // Only include exercises that belong to a belt when no specific belt is requested
    if (!beltName && !beltId) {
      exFilter.$or = [
        { beltNames: { $exists: true, $not: { $size: 0 } } },
        { beltName: { $exists: true, $ne: '' } },
      ];
    }
    const exercises = await Exercise.find(exFilter).sort({ createdAt: 1 });

    // 2. Technique model (training) — only when section is training or unset
    let techniques = [];
    if (!section || section === 'training') {
      const techFilter = { ...beltMatch };
      if (equipment) techFilter.equipment = equipment;
      if (!beltName && !beltId) {
        techFilter.$or = [
          { beltNames: { $exists: true, $not: { $size: 0 } } },
          { beltName: { $exists: true, $ne: '' } },
        ];
      }
      techniques = await Technique.find(techFilter).sort({ createdAt: 1 });
    }

    // Normalise techniques to exercise shape
    const normalisedTechniques = techniques.map(t => ({
      _id: t._id,
      name: t.name,
      section: 'training',
      equipment: t.equipment || 'chair',
      level: t.difficulty ? [t.difficulty] : [],
      beltNames: t.beltNames || [],
      beltName: t.beltName || '',
      image: t.image || null,
      videoUrl: t.videoUrl || '',
      steps: t.steps || [],
      tips: t.tips || [],
      isActive: true,
      createdAt: t.createdAt,
      _source: 'technique',
    }));

    // Merge, deduplicate by _id
    const seen = new Set();
    const merged = [];
    for (const ex of [...exercises, ...normalisedTechniques]) {
      const key = String(ex._id);
      if (!seen.has(key)) { seen.add(key); merged.push(ex); }
    }

    res.json({ status: 'success', data: { exercises: merged } });
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
    const programIds = req.body.programIdsJson ? JSON.parse(req.body.programIdsJson) : [];
    const programTitles = req.body.programTitlesJson ? JSON.parse(req.body.programTitlesJson) : [];
    const programId = programIds[0] || req.body.programId || null;
    const programTitle = programTitles[0] || req.body.programTitle || '';
    const image = req.files?.image?.[0] ? `uploads/exercises/${req.files.image[0].filename}` : null;
    const videoUrl = req.files?.video?.[0] ? `uploads/exercises/${req.files.video[0].filename}` : null;
    const exercise = new Exercise({ name, section, equipment, level, duration, beltId: beltId || null, beltName, beltNames, programId, programTitle, programIds, programTitles, image, videoUrl, steps, tips });
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
    if (req.body.programIdsJson !== undefined) {
      const programIds = JSON.parse(req.body.programIdsJson);
      const programTitles = req.body.programTitlesJson ? JSON.parse(req.body.programTitlesJson) : [];
      exercise.programIds = programIds;
      exercise.programTitles = programTitles;
      exercise.programId = programIds[0] || null;
      exercise.programTitle = programTitles[0] || '';
      exercise.markModified('programIds');
      exercise.markModified('programTitles');
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
