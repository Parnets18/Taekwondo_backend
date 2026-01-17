const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  duration: {
    months: {
      type: Number,
      required: true,
      min: 1
    },
    sessionsPerWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 7
    },
    sessionDuration: {
      type: Number, // in minutes
      required: true,
      min: 30
    }
  },
  fees: {
    registrationFee: {
      type: Number,
      required: true,
      min: 0
    },
    monthlyFee: {
      type: Number,
      required: true,
      min: 0
    },
    examFee: {
      type: Number,
      default: 0
    }
  },
  curriculum: [{
    week: {
      type: Number,
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    objectives: [String],
    techniques: [String]
  }],
  prerequisites: [String],
  ageGroup: {
    min: {
      type: Number,
      required: true,
      min: 4
    },
    max: {
      type: Number,
      required: true,
      max: 100
    }
  },
  schedule: {
    type: String,
    default: 'Mon, Wed, Fri - 6:00 PM'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
courseSchema.index({ level: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ 'ageGroup.min': 1, 'ageGroup.max': 1 });

module.exports = mongoose.model('Course', courseSchema);