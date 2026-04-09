const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  text:      { type: String, default: '' },
  subPoints: [{ type: mongoose.Schema.Types.Mixed }],
}, { _id: false });

const imageSchema = new mongoose.Schema({
  path: { type: String, default: '' },
  name: { type: String, default: '' },
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  tab:         { type: String, required: true },
  title:       { type: String, default: '' },
  subtitle:    { type: String, default: '' },
  description: { type: String, default: '' },
  images:      { type: [imageSchema], default: [] },
  headings:    { type: [String], default: [] },
  points:      { type: [pointSchema], default: [] },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('InstructorTitle', sectionSchema);
