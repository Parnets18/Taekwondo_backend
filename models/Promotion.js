const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  fromBelt: {
    type: String,
    required: true
  },
  toBelt: {
    type: String,
    required: true
  },
  promotionDate: {
    type: Date,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
promotionSchema.index({ studentName: 1 });
promotionSchema.index({ promotionDate: -1 });
promotionSchema.index({ toBelt: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);
