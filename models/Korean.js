const mongoose = require('mongoose');

const koreanSchema = new mongoose.Schema({
  section:  { type: String, required: true }, // e.g. "Stances"
  sectionKorean: { type: String, default: '' }, // e.g. "Sogi"
  korean:   { type: String, required: true },
  english:  { type: String, required: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Korean', koreanSchema);
