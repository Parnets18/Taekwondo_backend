const mongoose = require('mongoose');

const tenetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  korean: { type: String, required: true },
  intro: { type: String, required: true },
  points: [{ type: String }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Tenet', tenetSchema);
