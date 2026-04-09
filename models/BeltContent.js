const mongoose = require('mongoose');

const beltContentSchema = new mongoose.Schema({
  beltName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  image: { type: String, default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('BeltContent', beltContentSchema);
