const mongoose = require('mongoose');

const onboardingSlideSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  points: [{ type: String }],
  image: { type: String, default: null },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('OnboardingSlide', onboardingSlideSchema);
