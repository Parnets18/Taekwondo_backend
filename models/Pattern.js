const mongoose = require('mongoose');

const detailPointSchema = new mongoose.Schema({
  text: { type: String, default: '' },
}, { _id: false });

// Each point in list-of-techniques is tappable and opens a detail page
const techniquePointSchema = new mongoose.Schema({
  text:        { type: String, default: '' }, // shown in list
  // detail sections — can have multiple
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

const itemSchema = new mongoose.Schema({
  tab:          { type: String, required: true },
  order:        { type: Number, default: 0 },

  // list-of-techniques
  title:        { type: String, default: '' },
  name:         { type: String, default: '' },
  koreanName:   { type: String, default: '' },
  techPoints:   { type: [techniquePointSchema], default: [] }, // tappable points

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

const patternSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  moves:  { type: Number, default: 0 },
  image:  { type: String, default: '' },
  order:  { type: Number, default: 0 },
  items:  { type: [itemSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Pattern', patternSchema);
