const mongoose = require('mongoose');

const beltExamSchema = new mongoose.Schema({
  // Candidate Information
  candidateName: {
    type: String,
    required: [true, 'Candidate name is required'],
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
  parentGuardianName: {
    type: String,
    required: [true, 'Parent/Guardian name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  // Contact Information
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[+]?[1-9][\d]{9,14}$/, 'Please enter a valid phone number']
  },
  district: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  gmail: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Belt Information
  appearingForGrade: {
    type: String,
    required: [true, 'Appearing grade is required'],
    trim: true
  },
  presentBelt: {
    type: String,
    required: [true, 'Present belt is required'],
    trim: true
  },
  
  // Academic Information
  schoolName: {
    type: String,
    trim: true,
    maxlength: [200, 'School name cannot exceed 200 characters']
  },
  academicQualification: {
    type: String,
    trim: true
  },
  instructorName: {
    type: String,
    trim: true
  },
  
  // Photo
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
  
  // Exam Status
  examStatus: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'passed', 'failed'],
    default: 'pending'
  },
  
  // Exam Details
  examDate: {
    type: Date
  },
  examVenue: {
    type: String
  },
  examResult: {
    type: String
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    default: ''
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
  }
});

// Indexes for better query performance
beltExamSchema.index({ gmail: 1 });
beltExamSchema.index({ examStatus: 1 });
beltExamSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('BeltExam', beltExamSchema);
