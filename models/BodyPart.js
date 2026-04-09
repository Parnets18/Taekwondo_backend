const mongoose = require('mongoose');

const bodyPartSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  korean:      { type: String, default: '' },
  category:    { type: String, enum: ['attacking', 'blocking', 'vital', 'levels'], required: true },
  title:       { type: String, default: '' },
  subtitle:    { type: String, default: '' },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  images:      { type: [String], default: [] },
  // Blocking tools
  directions:  { type: [String], default: [] },
  parts:       { type: mongoose.Schema.Types.Mixed, default: [] },
  // Vital points
  points:      { type: mongoose.Schema.Types.Mixed, default: [] },
  // Levels tab
  tab:         { type: String, default: '' },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('BodyPart', bodyPartSchema);
