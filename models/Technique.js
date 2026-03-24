const mongoose = require('mongoose');

const techniqueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  videoUrl: { type: String, default: '' },
  image: { type: String, default: null },
  steps: [{ type: String }],
  tips: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Technique', techniqueSchema);
