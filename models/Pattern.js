const mongoose = require('mongoose');

const patternSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  moves:  { type: Number, default: 0 },
  image:  { type: String, default: '' },
  order:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Pattern', patternSchema);
