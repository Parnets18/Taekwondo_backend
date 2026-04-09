const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  image: { type: String, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
