const mongoose = require('mongoose');

// Recursive nested point schema
const pointSchema = new mongoose.Schema({
  text:        { type: String, default: '' },
  subPoints:   [{ type: mongoose.Schema.Types.Mixed }], // nested points
}, { _id: false });

const divisionSchema = new mongoose.Schema({
  category:    { type: String, required: true },   // e.g. "Hand techniques"
  title:       { type: String, required: true },   // e.g. "Attack techniques"
  subtitle:    { type: String, default: '' },
  description: { type: String, default: '' },
  headings:    { type: [String], default: [] },    // Just array of heading strings
  points:      { type: [pointSchema], default: [] }, // Separate points array
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TechniqueDivision', divisionSchema);
