const mongoose = require('mongoose');

const theoryOfPowerSchema = new mongoose.Schema({
  term: { type: String, required: true },
  korean: { type: String, required: true },
  desc: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TheoryOfPower', theoryOfPowerSchema);
