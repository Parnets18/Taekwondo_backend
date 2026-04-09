const mongoose = require('mongoose');

const moralCultureSchema = new mongoose.Schema({
  tab:         { type: String, default: '' },   // tab name this section belongs to
  title:       { type: String, default: '' },
  subtitle:    { type: String, default: '' },
  description: { type: String, default: '' },
  points:      { type: [String], default: [] },
  images:      { type: [String], default: [] },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('MoralCulture', moralCultureSchema);
