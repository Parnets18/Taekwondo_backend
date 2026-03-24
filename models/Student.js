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
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null
  },
  photo: {
    type: String,
    required: false,
    default: null
  },
  aadhar: {
    type: String,
    required: false,
    default: null
  },
  birthCertificate: {
    type: String,
    required: false,
    default: null
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
  password: {
    type: String,
    required: true,
    select: false // Don't include password in queries by default
  },
  address: {
    type: String,
    required: true
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    relationship: {
      type: String,
      default: ''
    }
  },
  
  // Family Information
  fatherName: {
    type: String,
    default: ''
  },
  motherName: {
    type: String,
    default: ''
  },
  fatherPhone: {
    type: String,
    default: ''
  },
  motherPhone: {
    type: String,
    default: ''
  },
  fatherOccupation: {
    type: String,
    default: ''
  },
  motherOccupation: {
    type: String,
    default: ''
  },
  
  // Educational Information
  schoolCollegeName: {
    type: String,
    default: ''
  },
  qualification: {
    type: String,
    default: ''
  },
  
  // Organization Information
  instructorName: {
    type: String,
    default: ''
  },
  classAddress: {
    type: String,
    default: ''
  },
  organizationName: {
    type: String,
    default: ''
  },
  admissionNumber: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  
  // Student Achievements
  achievements: [{
    tournamentName: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: null
    },
    // Multiple type-price pairs for each achievement
    typePrices: [{
      type: {
        type: String,
        enum: ['Individual Sparring', 'Group Sparring', 'Individual Tuls', 'Group Tuls', 'Power Breaking', 'Self Defence Techniques', ''],
        default: ''
      },
      price: {
        type: String,
        default: ''
      },
      certificateCode: {
        type: String,
        default: ''
      },
      certificateFile: {
        type: String,
        default: ''
      }
    }],
    // Keep old fields for backward compatibility
    type: {
      type: String,
      enum: ['Individual Sparring', 'Group Sparring', 'Individual Tuls', 'Group Tuls', 'Power Breaking', 'Self Defence Techniques', ''],
      default: ''
    },
    prize: {
      type: String,
      default: ''
    }
  }],
  
  // Exam Dates Details (Flattened for easier access)
  examWhiteBelt: {
    type: Date,
    default: null
  },
  examWhiteYellowStripe: {
    type: Date,
    default: null
  },
  examYellowStripe: {
    type: Date,
    default: null
  },
  examYellowBelt: {
    type: Date,
    default: null
  },
  examGreenStripe: {
    type: Date,
    default: null
  },
  examGreenBelt: {
    type: Date,
    default: null
  },
  examBlueStripe: {
    type: Date,
    default: null
  },
  examBlueBelt: {
    type: Date,
    default: null
  },
  examRedStripe: {
    type: Date,
    default: null
  },
  examRedBelt: {
    type: Date,
    default: null
  },
  examBlackStripe: {
    type: Date,
    default: null
  },
  examBlackBelt: {
    type: Date,
    default: null
  },
  examBlack2Dan: {
    type: Date,
    default: null
  },
  examBlack3Dan: {
    type: Date,
    default: null
  },
  examBlack4Dan: {
    type: Date,
    default: null
  },
  examBlack5Dan: {
    type: Date,
    default: null
  },
  examBlack6Dan: {
    type: Date,
    default: null
  },
  examBlack7Dan: {
    type: Date,
    default: null
  },
  examBlack8Dan: {
    type: Date,
    default: null
  },
  examBlack9Dan: {
    type: Date,
    default: null
  },
  currentBeltLevel: {
    type: String,
    default: ''
  },
  idNumber: {
    type: String,
    default: ''
  },
  
  // Academic Information
  currentBelt: {
    type: String,
    enum: [
      'white', 'white-yellow-stripe',
      'yellow', 'yellow-green-stripe',
      'green', 'green-blue-stripe',
      'blue', 'blue-red-stripe',
      'red', 'red-black-stripe',
      'black-1st', 'black-2nd', 'black-3rd', 'black-4th',
      'black-5th', 'black-6th', 'black-7th', 'black-8th', 'black-9th'
    ],
    default: 'white'
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

// Hash password before saving
studentSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    this.updatedAt = Date.now();
    return next();
  }

  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
studentSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Ensure virtual fields are included in JSON output
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// Indexes
studentSchema.index({ userId: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ currentBelt: 1 });
studentSchema.index({ courseLevel: 1 });

module.exports = mongoose.model('Student', studentSchema);