const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
  // Unique identifier and verification
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Student Information (flexible - can be just name or linked to student record)
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false // Made optional for manual entry
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Achievement Information
  achievementType: {
    type: String,
    required: true,
    enum: ['belt_promotion', 'course_completion', 'special_achievement', 'tournament_award', 'participation']
  },
  achievementDetails: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false // Made optional
    },
    level: {
      type: String // Belt level, course level, etc.
    },
    grade: {
      type: String // Performance grade if applicable
    },
    examiner: {
      type: String // Examining instructor name
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    eventId: {
      type: String // For special achievements/events
    }
  },
  
  // Template and Generation Info (made optional for manual certificates)
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertificateTemplate',
    required: false
  },
  issuedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // File Information
  filePath: {
    type: String,
    required: false // Made optional for cases where certificate is created without file initially
  },
  fileHash: {
    type: String,
    required: false
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  metadata: {
    templateVersion: {
      type: String,
      default: '1.0'
    },
    generationMethod: {
      type: String,
      enum: ['automated', 'manual'],
      default: 'manual'
    },
    fileSize: {
      type: Number
    },
    dimensions: {
      width: Number,
      height: Number
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    instructorName: {
      type: String // Store instructor name for manual certificates
    }
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

// Indexes for performance
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ studentId: 1 });
certificateSchema.index({ studentName: 1 });
certificateSchema.index({ achievementType: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ issuedDate: -1 });
certificateSchema.index({ 'achievementDetails.examiner': 1 });

// Update updatedAt before saving
certificateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to increment download count
certificateSchema.methods.incrementDownloadCount = function() {
  this.metadata.downloadCount += 1;
  return this.save();
};

// Method to revoke certificate
certificateSchema.methods.revoke = function() {
  this.status = 'revoked';
  return this.save();
};

// Virtual for getting image URL
certificateSchema.virtual('imageUrl').get(function() {
  if (this.filePath) {
    return `/uploads/certificates/${require('path').basename(this.filePath)}`;
  }
  return null;
});

// Ensure virtual fields are serialized
certificateSchema.set('toJSON', { virtuals: true });
certificateSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Certificate', certificateSchema);