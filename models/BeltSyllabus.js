const mongoose = require('mongoose');

const patternSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  name: { type: String, required: true },
  meaning: { type: String },
  movements: { type: Number },
  youtubeUrl: { type: String },
  horizontal: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false },
  technique: { type: String },
  moves: { type: String },
  diagramImage: { type: String }, // uploaded diagram image path
}, { _id: false });

const fundamentalMoveSchema = new mongoose.Schema({
  korean: { type: String, required: true },
  english: { type: String, required: true },
}, { _id: false });

const beltSyllabusSchema = new mongoose.Schema({
  beltName: { type: String, required: true, unique: true },
  recommendedDuration: { type: String }, // e.g. "6 months", "1 year"
  colourMeaning: { type: String },
  patterns: [patternSchema],
  sparring: { type: String },
  technique: { type: String },
  fundamentalMoves: [fundamentalMoveSchema],
  extraSections: [{
    heading: { type: String, required: true },
    points: [{ type: String }],
  }],
}, { timestamps: true });

module.exports = mongoose.model('BeltSyllabus', beltSyllabusSchema);
