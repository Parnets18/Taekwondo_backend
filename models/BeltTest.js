const mongoose = require('mongoose');

const beltTestSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  currentBelt: {
    type: String,
    required: true
  },
  testingFor: {
    type: String,
    required: true
  },
  testDate: {
    type: Date,
    required: true
  },
  readiness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'passed', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  testResult: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    evaluatedBy: String,
    evaluatedDate: Date
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
beltTestSchema.index({ studentName: 1 });
beltTestSchema.index({ testDate: 1 });
beltTestSchema.index({ status: 1 });

module.exports = mongoose.model('BeltTest', beltTestSchema);
