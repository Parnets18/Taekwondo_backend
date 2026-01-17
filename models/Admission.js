const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    default: 'Indian'
  },
  
  // Course Selection
  courseLevel: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['beginner', 'intermediate', 'advanced', 'black-belt']
  },
  preferredSchedule: {
    type: String,
    enum: ['morning', 'evening', 'weekend', 'flexible'],
    default: 'evening'
  },
  trainingGoals: {
    type: String
  },
  previousMartialArts: {
    type: String
  },
  fitnessLevel: {
    type: String
  },
  
  // Emergency Contact
  emergencyContactName: {
    type: String,
    required: [true, 'Emergency contact name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  emergencyContactPhone: {
    type: String,
    required: [true, 'Emergency contact phone is required'],
    match: [/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  relationshipToStudent: {
    type: String,
    required: [true, 'Relationship to student is required'],
    enum: ['parent', 'guardian', 'sibling', 'spouse', 'grandparent', 'other', 'friend']
  },
  emergencyContactAddress: {
    type: String,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  
  // Parent/Guardian Information (for minors)
  parentGuardianName: {
    type: String,
    trim: true
  },
  parentGuardianPhone: {
    type: String,
    trim: true
  },
  
  // Medical Information
  medicalConditions: {
    type: String,
    maxlength: [1000, 'Medical conditions cannot exceed 1000 characters'],
    default: ''
  },
  
  // Additional Information
  howDidYouHear: {
    type: String
  },
  specialRequests: {
    type: String,
    maxlength: [1000, 'Special requests cannot exceed 1000 characters']
  },
  
  // Agreements
  agreeToTerms: {
    type: Boolean,
    default: false
  },
  agreeToPhotos: {
    type: Boolean,
    default: false
  },
  agreeToEmails: {
    type: Boolean,
    default: false
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'waitlist'],
    default: 'pending'
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    default: ''
  },
  
  // Student ID (assigned after approval)
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Payment Information
  feesPaid: {
    type: Boolean,
    default: false
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date
  }
});

// Generate student ID
admissionSchema.methods.generateStudentId = function() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  this.studentId = `CW${year}${randomNum}`;
  return this.studentId;
};

// Calculate age
admissionSchema.virtual('age').get(function() {
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

// Indexes for better query performance
admissionSchema.index({ email: 1 });
admissionSchema.index({ status: 1 });
admissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Admission', admissionSchema);