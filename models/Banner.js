const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    required: [true, 'Banner subtitle is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Banner description is required'],
    trim: true
  },
  image: {
    type: String,
    required: false
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for sorting
bannerSchema.index({ order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
