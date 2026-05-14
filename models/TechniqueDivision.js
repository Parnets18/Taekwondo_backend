const mongoose = require('mongoose');

// ▸ Sub-sub-point
const subSubPointSchema = new mongoose.Schema({
  text:           { type: String, default: '' },
  detailSections: { type: Array,  default: [] },
}, { _id: false });

// ◦ Sub-point
const subPointSchema = new mongoose.Schema({
  text:           { type: String, default: '' },
  subPoints:      { type: [subSubPointSchema], default: [] },
  detailSections: { type: Array,  default: [] },
}, { _id: false });

// • Point
const pointSchema = new mongoose.Schema({
  text:           { type: String, default: '' },
  subPoints:      { type: [subPointSchema], default: [] },
  detailSections: { type: Array,  default: [] },
}, { _id: false });

// Heading block — one heading + its points
const headingBlockSchema = new mongoose.Schema({
  heading: { type: String, default: '' },
  points:  { type: [pointSchema], default: [] },
}, { _id: false });

// Section — title, subtitle, description + multiple heading blocks
const sectionSchema = new mongoose.Schema({
  title:         { type: String, default: '' },
  subtitle:      { type: String, default: '' },
  description:   { type: String, default: '' },
  // Legacy flat fields (kept for backward compat)
  heading:       { type: String, default: '' },
  points:        { type: [pointSchema], default: [] },
  // New: multiple heading+points blocks
  headingBlocks: { type: [headingBlockSchema], default: [] },
}, { _id: false });

// Top-level item
const techniqueDivisionSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  title:    { type: String, required: true, trim: true },
  sections: { type: [sectionSchema], default: [] },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TechniqueDivision', techniqueDivisionSchema);
