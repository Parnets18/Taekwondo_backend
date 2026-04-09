const mongoose = require('mongoose');

const dynastySchema = new mongoose.Schema({
  period: { type: String, required: true },
  name: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Dynasty', dynastySchema);
