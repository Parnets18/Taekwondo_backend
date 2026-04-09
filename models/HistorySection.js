const mongoose = require('mongoose');

const historySectionSchema = new mongoose.Schema({
  period: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('HistorySection', historySectionSchema);
