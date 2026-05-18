const Program = require('../models/Program');
const ProgramExercise = require('../models/ProgramExercise');
const fs = require('fs');
const path = require('path');
const { convertPathToUrl, convertToRelativePath, transformDocumentPaths } = require('../utils/pathConverter');

// ── Programs ──────────────────────────────────────────────────────────────────

const getPrograms = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const programs = await Program.find(filter).sort({ order: 1, createdAt: 1 });
    
    // Transform file paths to URLs
    const transformedPrograms = programs.map(program => 
      transformDocumentPaths(program, ['image'])
    );
    
    res.json({ status: 'success', data: { programs: transformedPrograms } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json({ status: 'error', message: 'Program not found' });
    
    // Transform file paths to URLs
    const transformedProgram = transformDocumentPaths(program, ['image']);
    
    res.json({ status: 'success', data: { program: transformedProgram } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createProgram = async (req, res) => {
  try {
    const { title, category } = req.body;
    const image = req.file ? `/uploads/programs/${req.file.filename}` : null;
    const program = new Program({ title, category, image });
    const saved = await program.save();
    
    // Transform file paths to URLs
    const transformedProgram = transformDocumentPaths(saved, ['image']);
    
    res.status(201).json({ status: 'success', data: { program: transformedProgram } });
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
      program.image = `/uploads/programs/${req.file.filename}`;
    }

    const updated = await program.save();
    
    // Transform file paths to URLs
    const transformedProgram = transformDocumentPaths(updated, ['image']);
    
    res.json({ status: 'success', data: { program: transformedProgram } });
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
    const Exercise = require('../models/Exercise');
    const Technique = require('../models/Technique');

    const { programId, section, equipment, level } = req.query;

    // Helper: build programId match for both legacy and array fields
    const programMatch = programId
      ? { $or: [{ programId }, { programIds: programId }] }
      : { $or: [{ programIds: { $exists: true, $not: { $size: 0 } } }, { programId: { $exists: true, $ne: null } }] };

    // 1. ProgramExercise (legacy dedicated collection)
    const peFilter = { isActive: true, ...programMatch };
    if (section) peFilter.section = section;
    if (equipment) peFilter.equipment = equipment;
    if (level) peFilter.level = level;
    const programExercises = await ProgramExercise.find(peFilter).sort({ createdAt: 1 });

    // 2. Exercise model (warmUp / stretching from TechniquesManagement)
    const exFilter = { isActive: true, ...programMatch };
    if (section) exFilter.section = section;
    if (equipment) exFilter.equipment = equipment;
    if (level) exFilter.level = level;
    const exercises = await Exercise.find(exFilter).sort({ createdAt: 1 });

    // 3. Technique model (training from TechniquesManagement) — only when section is training or unset
    let techniques = [];
    if (!section || section === 'training') {
      const techFilter = { ...programMatch };
      if (equipment) techFilter.equipment = equipment;
      if (level) techFilter.difficulty = level;
      techniques = await Technique.find(techFilter).sort({ createdAt: 1 });
    }

    // Normalise techniques to exercise shape
    const normalisedTechniques = techniques.map(t => ({
      _id: t._id,
      name: t.name,
      section: 'training',
      equipment: t.equipment || 'chair',
      level: t.difficulty ? [t.difficulty] : [],
      programIds: t.programIds || [],
      programTitles: t.programTitles || [],
      programId: t.programId || null,
      programTitle: t.programTitle || '',
      image: t.image || null,
      videoUrl: t.videoUrl || '',
      steps: t.steps || [],
      tips: t.tips || [],
      isActive: true,
      createdAt: t.createdAt,
      _source: 'technique',
    }));

    // Merge all, deduplicate by _id string
    const seen = new Set();
    const merged = [];
    for (const ex of [...programExercises, ...exercises, ...normalisedTechniques]) {
      const key = String(ex._id);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(ex);
      }
    }

    const transformedExercises = merged.map(exercise =>
      transformDocumentPaths(exercise, ['image', 'videoUrl'])
    );

    res.json({ status: 'success', data: { exercises: transformedExercises } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getProgramExercise = async (req, res) => {
  try {
    const exercise = await ProgramExercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ status: 'error', message: 'Exercise not found' });
    
    // Transform file paths to URLs
    const transformedExercise = transformDocumentPaths(exercise, ['image', 'videoUrl']);
    
    res.json({ status: 'success', data: { exercise: transformedExercise } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createProgramExercise = async (req, res) => {
  try {
    const { name, section, equipment, programId, programTitle } = req.body;
    const steps = req.body.stepsJson ? JSON.parse(req.body.stepsJson) : [];
    const tips = req.body.tipsJson ? JSON.parse(req.body.tipsJson) : [];
    const level = req.body.levelJson ? JSON.parse(req.body.levelJson) : [];
    const programIds = req.body.programIdsJson ? JSON.parse(req.body.programIdsJson) : [];
    const programTitles = req.body.programTitlesJson ? JSON.parse(req.body.programTitlesJson) : [];
    // Keep legacy fields for backward compat
    const legacyProgramId = programIds[0] || programId || null;
    const legacyProgramTitle = programTitles[0] || programTitle || '';
    const image = req.files?.image?.[0] ? `/uploads/programs/${req.files.image[0].filename}` : null;
    const videoUrl = req.files?.video?.[0] ? `/uploads/programs/${req.files.video[0].filename}` : null;
    const exercise = new ProgramExercise({
      name, section, equipment, level,
      programId: legacyProgramId, programTitle: legacyProgramTitle,
      programIds, programTitles,
      image, videoUrl, steps, tips,
    });
    const saved = await exercise.save();
    
    // Transform file paths to URLs
    const transformedExercise = transformDocumentPaths(saved, ['image', 'videoUrl']);
    
    res.status(201).json({ status: 'success', data: { exercise: transformedExercise } });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

const updateProgramExercise = async (req, res) => {
  try {
    const exercise = await ProgramExercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ status: 'error', message: 'Exercise not found' });

    const fields = ['name', 'section', 'equipment', 'programId', 'programTitle', 'isActive'];
    fields.forEach(f => { if (req.body[f] !== undefined) exercise[f] = req.body[f]; });
    if (req.body.levelJson !== undefined) {
      exercise.level = JSON.parse(req.body.levelJson);
      exercise.markModified('level');
    } else if (req.body.level !== undefined) {
      exercise.level = Array.isArray(req.body.level) ? req.body.level : [req.body.level];
      exercise.markModified('level');
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
    if (req.body.stepsJson !== undefined) exercise.steps = JSON.parse(req.body.stepsJson);
    if (req.body.tipsJson !== undefined) exercise.tips = JSON.parse(req.body.tipsJson);

    if (req.files?.image?.[0]) {
      if (exercise.image) { const old = path.join(__dirname, '..', exercise.image); if (fs.existsSync(old)) fs.unlinkSync(old); }
      exercise.image = `/uploads/programs/${req.files.image[0].filename}`;
    }
    if (req.files?.video?.[0]) {
      if (exercise.videoUrl) { const old = path.join(__dirname, '..', exercise.videoUrl); if (fs.existsSync(old)) fs.unlinkSync(old); }
      exercise.videoUrl = `/uploads/programs/${req.files.video[0].filename}`;
    }

    const updated = await exercise.save();
    
    // Transform file paths to URLs
    const transformedExercise = transformDocumentPaths(updated, ['image', 'videoUrl']);
    
    res.json({ status: 'success', data: { exercise: transformedExercise } });
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
