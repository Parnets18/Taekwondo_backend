const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  beltId: { type: mongoose.Schema.Types.ObjectId, ref: 'BeltContent', default: null },
  beltName: { type: String, default: '' },       // legacy single belt
  beltNames: { type: [String], default: [] },    // new multi-belt array
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', default: null },  // legacy
  programTitle: { type: String, default: '' },   // legacy
  programIds: { type: [String], default: [] },   // multi-program
  programTitles: { type: [String], default: [] },// multi-program titles
  section: { type: String, required: true, enum: ['warmUp', 'training', 'stretching'] },
  equipment: { type: String, required: true, enum: ['all', 'chair', 'noChair'], default: 'all' },
  level: { type: [{ type: String, enum: ['Easy', 'Advance', 'Master'] }], default: [] },
  duration: { type: String, default: '25 sec' },
  image: { type: String, default: null },
  videoUrl: { type: String, default: null },
  steps: [{ type: String }],
  tips: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);
