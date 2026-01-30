const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    default: null
  },
  location: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['Tournament', 'Grading', 'Seminar', 'Training Camp', 'Workshop', 'Competition', 'Other'],
    default: 'Other'
  },
  level: {
    type: String,
    enum: ['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Black Belt'],
    default: 'All Levels'
  },
  maxParticipants: {
    type: Number,
    default: null
  },
  registrationFee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  registrationDeadline: {
    type: Date,
    default: null
  },
  organizer: {
    type: String,
    default: 'Taekwondo Academy'
  },
  contactInfo: {
    phone: String,
    email: String
  },
  requirements: [{
    type: String
  }],
  prizes: [{
    position: String,
    prize: String
  }],
  registeredParticipants: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for participant count
eventSchema.virtual('participantCount').get(function() {
  return this.registeredParticipants ? this.registeredParticipants.length : 0;
});

// Virtual for status based on date
eventSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  const eventDate = new Date(this.date);
  
  if (this.status === 'Cancelled') return 'Cancelled';
  if (eventDate < now) return 'Past';
  if (eventDate.toDateString() === now.toDateString()) return 'Today';
  return 'Upcoming';
});

// Index for faster queries
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ level: 1 });

module.exports = mongoose.model('Event', eventSchema);