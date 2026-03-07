const mongoose = require('mongoose');

const founderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Schema for shared description
const founderDescriptionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

founderSchema.index({ order: 1 });

const Founder = mongoose.model('Founder', founderSchema);
const FounderDescription = mongoose.model('FounderDescription', founderDescriptionSchema);

module.exports = { Founder, FounderDescription };
