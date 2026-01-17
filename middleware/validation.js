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
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('phone')
    .matches(/^[+]?[1-9][\d\s\-\(\)]{9,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('address')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  
  body('courseLevel')
    .isIn(['beginner', 'intermediate', 'advanced', 'black-belt'])
    .withMessage('Course level must be beginner, intermediate, advanced, or black-belt'),
  
  body('emergencyContactName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
  
  body('emergencyContactPhone')
    .matches(/^[+]?[1-9][\d\s\-\(\)]{9,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  
  body('relationshipToStudent')
    .isIn(['parent', 'guardian', 'sibling', 'spouse', 'grandparent', 'other', 'friend'])
    .withMessage('Please select a valid relationship'),
  
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

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateAdmission,
  validateContact,
  validateCourse,
  handleValidationErrors
};