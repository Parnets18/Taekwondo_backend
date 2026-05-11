const mongoose = require('mongoose');

// Recursive nested point schema
const pointSchema = new mongoose.Schema({
  text:        { type: String, default: '' },
  subPoints:   [{ type: mongoose.Schema.Types.Mixed }], // nested points
}, { _id: false });

// Section schema: optional heading + its own points
const sectionSchema = new mongoose.Schema({
  heading: { type: String, default: '' },   // optional heading
  points:  { type: [pointSchema], default: [] },
}, { _id: false });

const divisionSchema = new mongoose.Schema({
  category:    { type: String, required: true },   // e.g. "Hand techniques"
  title:       { type: String, required: true },   // e.g. "Attack techniques"
  subtitle:    { type: String, default: '' },
  description: { type: String, default: '' },
  // New unified sections field (heading optional + points inside each section)
  sections:    { type: [sectionSchema], default: [] },
  // Legacy fields kept for backward compatibility
  headings:    { type: [String], default: [] },
  points:      { type: [pointSchema], default: [] },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TechniqueDivision', divisionSchema);
