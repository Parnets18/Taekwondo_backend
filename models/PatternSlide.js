const mongoose = require('mongoose');

// For non-standard-list: each point can have a detail page (title + points)
const detailSchema = new mongoose.Schema({
  title:  { type: String, default: '' },
  points: [{ text: { type: String, default: '' } }],
}, { _id: false });

// For non-standard-list: simplified pattern entries structure
const patternEntrySchema = new mongoose.Schema({
  number:      { type: String, default: '' },
  koreanTerm:  { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

// For kicks-in-patterns: each point detail has pattern entries
const kickRowSchema = new mongoose.Schema({
  koreanTerm:  { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const kickEntrySchema = new mongoose.Schema({
  patternName: { type: String, default: '' },
  number:      { type: String, default: '' },
  rows:        { type: [kickRowSchema], default: [] }, // multiple korean term + description
}, { _id: false });

const pointSchema = new mongoose.Schema({
  text:           { type: String, default: '' },
  kickEntries:    { type: [kickEntrySchema], default: [] }, // used by kicks-in-patterns
  patternEntries: { type: [patternEntrySchema], default: [] }, // used by non-standard-list
  details:        { type: [detailSchema], default: [] },    // legacy
  subPoints:      [{ type: mongoose.Schema.Types.Mixed }],
}, { _id: false });

const slideSchema = new mongoose.Schema({
  slide:       { type: String, required: true },
  title:       { type: String, default: '' },
  subtitle:    { type: String, default: '' },
  description: { type: String, default: '' },
  headings:    { type: [String], default: [] },
  points:      { type: [pointSchema], default: [] },
  images:      { type: [String], default: [] },
  // list fields
  name:        { type: String, default: '' },
  moves:       { type: Number, default: 0 },
  number:      { type: String, default: '' },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('PatternSlide', slideSchema);
