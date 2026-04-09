const mongoose = require('mongoose');

const doJangSchema = new mongoose.Schema({
  title:       { type: String, default: '' },
  subtitle:    { type: String, default: '' },
  description: { type: String, default: '' },
  points:      { type: [String], default: [] },
  images:      { type: [String], default: [] },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('DoJang', doJangSchema);
