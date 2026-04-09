const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  num:     { type: Number, required: true },
  title:   { type: String, default: '' },
  details: { type: [String], default: [] },
}, { _id: false });

const attackSchema = new mongoose.Schema({
  num:  { type: String, default: '' },
  text: { type: String, default: '' },
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  title:  { type: String, default: '' },
  content:{ type: String, default: '' },
  points: { type: [String], default: [] },
  image:  { type: String, default: '' },
}, { _id: false });

const sparringSchema = new mongoose.Schema({
  type:        { type: String, required: true, unique: true }, // '3-step', '2-step', '1-step', 'free'
  title:       { type: String, required: true },
  whatIs:      { type: String, default: '' },
  attackingIntro: { type: String, default: '' },
  attacks:     { type: [attackSchema], default: [] },
  defending:   { type: String, default: '' },
  routines:    { type: [routineSchema], default: [] },
  sections:    { type: [sectionSchema], default: [] },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Sparring', sparringSchema);
