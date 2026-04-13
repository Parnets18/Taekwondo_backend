const mongoose = require('mongoose');

const detailSectionSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  description: { type: String },
  image: { type: String },
  points: [{ type: String }],
}, { _id: false });

const pointSchema = new mongoose.Schema({
  text: { type: String, required: true },
  details: [detailSectionSchema],
}, { _id: false });

const basicTheoryContentSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  koreanName: { type: String },
  description: { type: String },
  image: { type: String },
  points: [pointSchema], // Keep for backward compatibility
  headingPointGroups: [{
    heading: { type: String, default: '' },
    points: [{
      text: { type: String, required: true },
      description: { type: String, default: '' }, // Optional expandable description
      details: [detailSectionSchema],
    }]
  }],
  fullDetails: [{
    title: { type: String },
    subtitle: { type: String },
    image: { type: String },
    paragraphs: [{ type: String }],
    points: [{ type: String }],
  }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('BasicTheoryContent', basicTheoryContentSchema);
