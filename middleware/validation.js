const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Request body:', req.body);
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Admission form validation
const validateAdmission = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('fatherName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Father name must be between 2 and 100 characters'),
  
  body('motherName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Mother name must be between 2 and 100 characters'),
  
  body('residentialAddress')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Residential address must be between 5 and 500 characters'),
  
  body('mobileNumber')
    .matches(/^[+]?[1-9][\d\s\-\(\)]{9,15}$/)
    .withMessage('Please provide a valid mobile number'),
  
  body('emergencyContact')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[1-9][\d\s\-\(\)]{9,15}$/)
    .withMessage('Please provide a valid emergency contact number'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('aadhaarNumber')
    .optional({ checkFalsy: true })
    .matches(/^\d{12}$/)
    .withMessage('Aadhaar number must be 12 digits'),
  
  body('bloodGroup')
    .optional({ checkFalsy: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
  
  body('height')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Height must be a positive number'),
  
  body('weight')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('physicalDisorder')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Physical disorder description must not exceed 500 characters'),
  
  handleValidationErrors
];

// Contact form validation
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('inquiryType')
    .isIn(['admission', 'courses', 'schedule', 'fees', 'trial', 'other'])
    .withMessage('Please select a valid inquiry type'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  
  handleValidationErrors
];

// Course validation
const validateCourse = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Course name must be between 2 and 100 characters'),
  
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Course level must be beginner, intermediate, or advanced'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('duration.months')
    .isInt({ min: 1 })
    .withMessage('Duration in months must be at least 1'),
  
  body('duration.sessionsPerWeek')
    .isInt({ min: 1, max: 7 })
    .withMessage('Sessions per week must be between 1 and 7'),
  
  body('duration.sessionDuration')
    .isInt({ min: 30 })
    .withMessage('Session duration must be at least 30 minutes'),
  
  body('fees.registrationFee')
    .isFloat({ min: 0 })
    .withMessage('Registration fee must be a positive number'),
  
  body('fees.monthlyFee')
    .isFloat({ min: 0 })
    .withMessage('Monthly fee must be a positive number'),
  
  body('ageGroup.min')
    .isInt({ min: 4 })
    .withMessage('Minimum age must be at least 4'),
  
  body('ageGroup.max')
    .isInt({ min: 4, max: 100 })
    .withMessage('Maximum age must be between 4 and 100'),
  
  body('maxStudents')
    .isInt({ min: 1 })
    .withMessage('Maximum students must be at least 1'),
  
  handleValidationErrors
];

// Belt exam validation
const validateBeltExam = [
  body('candidateName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Candidate name must be between 2 and 100 characters'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  
  body('parentGuardianName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Parent/Guardian name must be between 2 and 100 characters'),
  
  body('address')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  
  body('phoneNumber')
    .matches(/^[+]?[1-9][\d\s\-\(\)]{9,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('district')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('District must not exceed 100 characters'),
  
  body('state')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  
  body('gmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('appearingForGrade')
    .trim()
    .notEmpty()
    .withMessage('Appearing grade is required'),
  
  body('presentBelt')
    .trim()
    .notEmpty()
    .withMessage('Present belt is required'),
  
  body('schoolName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('School name must not exceed 200 characters'),
  
  body('academicQualification')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Academic qualification must not exceed 200 characters'),
  
  body('instructorName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Instructor name must not exceed 100 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateAdmission,
  validateContact,
  validateCourse,
  validateBeltExam,
  handleValidationErrors
};