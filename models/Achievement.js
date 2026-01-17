const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  // Basic Information
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Achievement Details
  type: {
    type: String,
    required: true,
    enum: [
      'belt_promotion',
      'course_completion', 
      'perfect_attendance',
      'tournament_participation',
      'tournament_winner',
      'years_of_training',
      'instructor_recognition',
      'community_service'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['belt_promotion', 'course_completion', 'attendance', 'tournament', 'special']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  dateAchieved: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Related Records
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  },
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  },
  
  // Achievement Value
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Additional Metadata
  metadata: {
    beltLevel: String,
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    attendancePercentage: Number,
    tournamentName: String,
    position: String,
    yearsCompleted: Number,
    recognizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    additionalNotes: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
achievementSchema.index({ studentId: 1 });
achievementSchema.index({ type: 1 });
achievementSchema.index({ category: 1 });
achievementSchema.index({ dateAchieved: -1 });

// Virtual for age of achievement
achievementSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.dateAchieved) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Achievement', achievementSchema);