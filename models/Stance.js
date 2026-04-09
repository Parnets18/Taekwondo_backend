const mongoose = require('mongoose');

const stanceSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  korean:      { type: String, required: true },
  title:       { type: String, default: '' },
  weight:      { type: String, default: '' },
  width:       { type: String, default: '' },
  length:      { type: String, default: '' },
  facing:      { type: String, default: '' },
  lr:          { type: String, default: '' },
  description: { type: String, default: '' },
  diagramImage:{ type: String, default: '' },
  personImages:{ type: [String], default: [] },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Stance', stanceSchema);
