const mongoose = require('mongoose');

const programExerciseSchema = new mongoose.Schema({
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', default: null },
  programTitle: { type: String, default: '' },
  name: { type: String, required: true, trim: true },
  section: { type: String, required: true, enum: ['warmUp', 'training', 'stretching'] },
  equipment: { type: String, required: true, enum: ['chair', 'noChair'], default: 'chair' },
  level: { type: String, enum: ['Easy', 'Advance', 'Master'], default: 'Easy' },
  image: { type: String, default: null },
  videoUrl: { type: String, default: null },
  steps: [{ type: String }],
  tips: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ProgramExercise', programExerciseSchema);
