const mongoose = require('mongoose');

const theoryQuestionSchema = new mongoose.Schema({
  beltLevel: {
    type: String,
    required: true,
  },
  question:  { type: String, required: true },
  options:   { type: [String], required: true },
  answer:    { type: String, required: true },
  order:     { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('TheoryQuestion', theoryQuestionSchema);
