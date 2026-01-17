const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

const {
  getFees,
  getFeeById,
  createFee,
  updateFee,
  recordPayment,
  deleteFee,
  getFeeStatistics,
  getStudentFees,
  generateBulkFees
} = require('../controllers/feeController');

const { protect, adminOnly } = require('../middleware/auth');

// Validation middleware
const validateFeeCreation = [
  body('studentName')
    .notEmpty()
    .withMessage('Student name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  
  body('course')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Course must be Beginner, Intermediate, or Advanced'),
  
  body('feeType')
    .isIn(['Monthly Fee', 'Registration Fee', 'Exam Fee', 'Equipment Fee', 'Late Fee'])
    .withMessage('Invalid fee type'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('discount.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const validatePaymentRecord = [
  body('paymentMethod')
    .isIn(['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'])
    .withMessage('Invalid payment method'),
  
  body('paidDate')
    .optional()
    .isISO8601()
    .withMessage('Paid date must be a valid date'),
  
  body('transactionId')
    .optional({ checkFalsy: true })
    .isLength({ min: 3, max: 100 })
    .withMessage('Transaction ID must be between 3 and 100 characters'),
  
  body('lateFee.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Late fee amount must be a positive number'),
  
  body('discount.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount amount must be a positive number'),
  
  body('notes')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const validateBulkFeeGeneration = [
  body('course')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Course must be Beginner, Intermediate, or Advanced'),
  
  body('feeType')
    .isIn(['Monthly Fee', 'Registration Fee', 'Exam Fee', 'Equipment Fee', 'Late Fee'])
    .withMessage('Invalid fee type'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid fee ID format')
];

// Public routes (none for fees - all require authentication)

// Protected routes - require authentication
router.use(protect);

// GET /api/fees - Get all fees with filtering and pagination
router.get('/', getFees);

// GET /api/fees/statistics - Get fee statistics
router.get('/statistics', getFeeStatistics);

// GET /api/fees/student/:studentName - Get fees for a specific student
router.get('/student/:studentName', 
  param('studentName').notEmpty().withMessage('Student name is required'),
  getStudentFees
);

// GET /api/fees/:id - Get fee by ID
router.get('/:id', validateObjectId, getFeeById);

// Admin only routes
router.use(adminOnly);

// POST /api/fees - Create new fee record (matching frontend structure)
router.post('/', async (req, res) => {
  console.log('=== FEE CREATION ROUTE HIT ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const Fee = require('../models/Fee');
    
    // Extract data exactly as frontend sends it
    const {
      studentName,
      course,
      feeType,
      amount,
      dueDate,
      discount,
      notes
    } = req.body;
    
    console.log('Extracted data:', {
      studentName,
      course,
      feeType,
      amount,
      dueDate,
      discount,
      notes
    });
    
    // Validate required fields
    if (!studentName || !course || !feeType || !amount || !dueDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        required: ['studentName', 'course', 'feeType', 'amount', 'dueDate']
      });
    }
    
    // Create fee data object
    const feeData = {
      studentName,
      course,
      feeType,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate)
    };
    
    // Add optional fields if provided
    if (discount && discount.amount > 0) {
      feeData.discount = discount;
    }
    
    if (notes) {
      feeData.notes = notes;
    }
    
    console.log('Final fee data:', JSON.stringify(feeData, null, 2));
    
    const fee = new Fee(feeData);
    await fee.save();
    
    console.log('Fee created successfully:', fee._id);
    
    res.status(201).json({
      status: 'success',
      message: 'Fee record created successfully',
      data: { fee }
    });
    
  } catch (error) {
    console.error('Fee creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create fee record',
      error: error.message
    });
  }
});

// POST /api/fees/bulk - Generate bulk fees
router.post('/bulk', validateBulkFeeGeneration, generateBulkFees);

// PUT /api/fees/:id - Update fee record
router.put('/:id', 
  validateObjectId,
  validateFeeCreation,
  updateFee
);

// POST /api/fees/:id/payment - Record payment
router.post('/:id/payment', 
  validateObjectId,
  validatePaymentRecord,
  recordPayment
);

// DELETE /api/fees/:id - Delete fee record
router.delete('/:id', validateObjectId, deleteFee);

module.exports = router;