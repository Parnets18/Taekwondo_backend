const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  beltId: { type: mongoose.Schema.Types.ObjectId, ref: 'BeltContent', default: null },
  beltName: { type: String, default: '' },       // legacy single belt
  beltNames: { type: [String], default: [] },    // new multi-belt array
  section: { type: String, required: true, enum: ['warmUp', 'training', 'stretching'] },
  equipment: { type: String, required: true, enum: ['all', 'chair', 'noChair'], default: 'all' },
  level: { type: [{ type: String, enum: ['Easy', 'Advance', 'Master'] }], default: [] },
  duration: { type: String, default: '25 sec' },
  image: { type: String, default: null },
  videoUrl: { type: String, default: null },  // stored path for uploaded video file
  steps: [{ type: String }],
  tips: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);
