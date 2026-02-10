const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    uppercase: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  age: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  motherName: {
    type: String,
    required: [true, 'Mother name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  residentialAddress: {
    type: String,
    required: [true, 'Residential address is required'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^[+]?[1-9][\d]{9,14}$/, 'Please enter a valid phone number']
  },
  emergencyContact: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  aadhaarNumber: {
    type: String,
    trim: true,
    maxlength: [12, 'Aadhaar number must be 12 digits']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: ''
  },
  height: {
    type: Number,
    min: [0, 'Height must be positive']
  },
  weight: {
    type: Number,
    min: [0, 'Weight must be positive']
  },
  physicalDisorder: {
    type: String,
    maxlength: [500, 'Physical disorder description cannot exceed 500 characters'],
    default: ''
  },
  photo: {
    type: String,
    default: ''
  },
  
  // Agreements
  agreeToTerms: {
    type: Boolean,
    required: [true, 'You must agree to terms and conditions'],
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

// Calculate age from date of birth
admissionSchema.virtual('calculatedAge').get(function() {
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