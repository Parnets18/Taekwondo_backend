const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Basic Information
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  admissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission'
  },
  
  // Personal Details
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  
  // Contact Information
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  address: {
    type: String,
    required: true
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    }
  },
  
  // Academic Information
  currentBelt: {
    type: String,
    enum: ['white', 'yellow', 'green', 'blue', 'red', 'black-1st', 'black-2nd', 'black-3rd'],
    default: 'white'
  },
  courseLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  
  // Attendance
  attendanceRecords: [{
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  
  // Belt Progression
  beltHistory: [{
    belt: {
      type: String,
      required: true
    },
    awardedDate: {
      type: Date,
      required: true
    },
    examiner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  
  // Fees and Payments
  feeStructure: {
    monthlyFee: {
      type: Number,
      required: true,
      default: 2000
    },
    registrationFee: {
      type: Number,
      default: 1000
    },
    examFee: {
      type: Number,
      default: 500
    }
  },
  
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      required: true
    },
    paymentType: {
      type: String,
      enum: ['monthly', 'registration', 'exam', 'other'],
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank-transfer'],
      required: true
    },
    receiptNumber: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'paid'
    }
  }],
  
  // Medical Information
  medicalInfo: {
    conditions: {
      type: String,
      default: ''
    },
    allergies: {
      type: String,
      default: ''
    },
    medications: {
      type: String,
      default: ''
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Performance Tracking
  skillAssessments: [{
    date: {
      type: Date,
      required: true
    },
    assessor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    skills: {
      forms: {
        type: Number,
        min: 1,
        max: 10
      },
      sparring: {
        type: Number,
        min: 1,
        max: 10
      },
      techniques: {
        type: Number,
        min: 1,
        max: 10
      },
      discipline: {
        type: Number,
        min: 1,
        max: 10
      }
    },
    overallGrade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
    },
    comments: {
      type: String,
      default: ''
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'graduated'],
    default: 'active'
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

// Calculate age
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Calculate attendance percentage
studentSchema.virtual('attendancePercentage').get(function() {
  if (!this.attendanceRecords || this.attendanceRecords.length === 0) return 0;
  
  const presentCount = this.attendanceRecords.filter(record => 
    record.status === 'present' || record.status === 'late'
  ).length;
  
  return Math.round((presentCount / this.attendanceRecords.length) * 100);
});

// Update updatedAt before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure virtual fields are included in JSON output
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Indexes
studentSchema.index({ userId: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ currentBelt: 1 });
studentSchema.index({ courseLevel: 1 });

module.exports = mongoose.model('Student', studentSchema);