const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  // Basic Information
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  iconUrl: {
    type: String,
    required: true
  },
  
  // Badge Properties
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'uncommon', 'rare', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  
  // Criteria for earning the badge
  criteria: {
    type: {
      type: String,
      required: true,
      enum: ['attendance', 'belt_promotion', 'course_completion', 'tournament', 'years_service', 'special']
    },
    requirements: {
      attendancePercentage: Number,
      beltLevel: String,
      courseLevel: String,
      tournamentPlacements: Number,
      yearsRequired: Number,
      specialConditions: [String]
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
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
badgeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ 'criteria.type': 1 });
badgeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Badge', badgeSchema);