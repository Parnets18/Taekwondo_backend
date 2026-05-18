const mongoose = require('mongoose');

const detailPointSchema = new mongoose.Schema({
  text: { type: String, default: '' },
}, { _id: false });

const techniquePointSchema = new mongoose.Schema({
  text:        { type: String, default: '' },
  details: [{
    title:       { type: String, default: '' },
    subtitle:    { type: String, default: '' },
    description: { type: String, default: '' },
    heading:     { type: String, default: '' },
    points:      [{ text: { type: String, default: '' } }],
  }],
}, { _id: false });

const simplePointSchema = new mongoose.Schema({
  text:      { type: String, default: '' },
  subPoints: [{ type: mongoose.Schema.Types.Mixed }],
}, { _id: false });

const entrySchema = new mongoose.Schema({
  patternId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Pattern', required: true },
  patternName:  { type: String, required: true }, // denormalized for quick access
  tab:          { type: String, required: true },
  order:        { type: Number, default: 0 },

  // list-of-techniques
  title:        { type: String, default: '' },
  name:         { type: String, default: '' },
  koreanName:   { type: String, default: '' },
  techPoints:   { type: [techniquePointSchema], default: [] },

  // information
  infoTitle:    { type: String, default: '' },
  diagram:      { type: String, default: '' },
  points:       { type: [simplePointSchema], default: [] },

  // description
  descHeading:  { type: String, default: '' },
  descSubHeading:{ type: String, default: '' },
  descDiagram:  { type: String, default: '' },
  description:  { type: String, default: '' },

  // new-techniques / modified-techniques
  ntTitle:      { type: String, default: '' },
  ntPoints:     { type: [simplePointSchema], default: [] },
}, { timestamps: true });

// Index for faster queries by pattern
entrySchema.index({ patternId: 1, order: 1 });

module.exports = mongoose.model('Entry', entrySchema);
