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

// Public routes (for testing/demo) - MUST be before protect middleware
router.get('/public', async (req, res) => {
  try {
    console.log('💰 Public fees route called');
    console.log('💰 Query params:', req.query);
    
    // Try to fetch from database first
    const Fee = require('../models/Fee');
    
    try {
      const { status, course, feeType, month, year, search, limit } = req.query;
      const filter = {};
      
      // Apply filters
      if (status && status !== 'all') {
        filter.status = status;
      }
      
      if (course && course !== 'all') {
        filter.course = course;
      }
      
      if (feeType && feeType !== 'all') {
        filter.feeType = feeType;
      }
      
      if (month && year) {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        filter.dueDate = { $gte: startDate, $lte: endDate };
      } else if (year) {
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31);
        filter.dueDate = { $gte: startDate, $lte: endDate };
      }
      
      if (search) {
        filter.$or = [
          { studentName: { $regex: search, $options: 'i' } },
          { feeId: { $regex: search, $options: 'i' } },
          { transactionId: { $regex: search, $options: 'i' } }
        ];
      }
      
      console.log('💰 Database filter:', filter);
      
      // Fetch from database
      const dbFees = await Fee.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) || 100);
      
      console.log(`✅ Found ${dbFees.length} fees in database`);
      
      // If database has data, return it
      if (dbFees.length > 0) {
        return res.status(200).json({
          status: 'success',
          data: { 
            fees: dbFees,
            count: dbFees.length,
            source: 'database',
            query: req.query
          }
        });
      }
      
      console.log('⚠️ No fees found in database, using sample data...');
    } catch (dbError) {
      console.log('⚠️ Database query failed, using sample data:', dbError.message);
    }
    
    // Fallback to sample data if database is empty or fails
    const sampleFeesData = [
      {
        _id: 'FEE-SAMPLE-001',
        feeId: 'FEE2025001',
        studentName: 'Sarah Johnson',
        course: 'Advanced',
        feeType: 'Monthly Fee',
        amount: 3500,
        paidAmount: 3500,
        pendingAmount: 0,
        dueDate: new Date('2025-02-01'),
        status: 'Paid',
        paymentMethod: 'UPI',
        transactionId: 'UPI123456789',
        paidDate: new Date('2025-01-28'),
        receiptNumber: 'RCP2025001',
        discount: { amount: 0, reason: null },
        lateFee: { amount: 0, appliedDate: null },
        paymentHistory: [{
          amount: 3500,
          paymentMethod: 'UPI',
          transactionId: 'UPI123456789',
          paidDate: new Date('2025-01-28'),
          recordedBy: 'ADMIN-001'
        }],
        notes: 'February 2025 monthly training fee',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-25'),
        updatedAt: new Date('2025-01-28')
      },
      {
        _id: 'FEE-SAMPLE-002',
        feeId: 'FEE2025002',
        studentName: 'John Smith',
        course: 'Intermediate',
        feeType: 'Belt Test Fee',
        amount: 1800,
        paidAmount: 0,
        pendingAmount: 1800,
        dueDate: new Date('2025-02-15'),
        status: 'Pending',
        paymentMethod: null,
        transactionId: null,
        paidDate: null,
        receiptNumber: null,
        discount: { amount: 0, reason: null },
        lateFee: { amount: 0, appliedDate: null },
        paymentHistory: [],
        notes: 'Blue belt promotion test fee',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date('2025-01-20')
      },
      {
        _id: 'FEE-SAMPLE-003',
        feeId: 'FEE2025003',
        studentName: 'Golu Vishwakarma',
        course: 'Advanced',
        feeType: 'Equipment Fee',
        amount: 3200,
        paidAmount: 1600,
        pendingAmount: 1600,
        dueDate: new Date('2025-02-10'),
        status: 'Partial',
        paymentMethod: 'Cash',
        transactionId: 'CASH20250130',
        paidDate: new Date('2025-01-30'),
        receiptNumber: 'RCP2025002',
        discount: { amount: 0, reason: null },
        lateFee: { amount: 0, appliedDate: null },
        paymentHistory: [{
          amount: 1600,
          paymentMethod: 'Cash',
          transactionId: 'CASH20250130',
          paidDate: new Date('2025-01-30'),
          recordedBy: 'ADMIN-001'
        }],
        notes: 'Sparring gear and uniform - Partial payment received',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-30')
      },
      {
        _id: 'FEE-SAMPLE-004',
        feeId: 'FEE2025004',
        studentName: 'Arjun Sharma M',
        course: 'Expert',
        feeType: 'Competition Fee',
        amount: 2200,
        paidAmount: 0,
        pendingAmount: 2200,
        dueDate: new Date('2025-01-31'),
        status: 'Overdue',
        paymentMethod: null,
        transactionId: null,
        paidDate: null,
        receiptNumber: null,
        discount: { amount: 0, reason: null },
        lateFee: { amount: 220, appliedDate: new Date('2025-02-01') },
        paymentHistory: [],
        notes: 'State championship registration fee - Overdue',
        createdBy: 'ADMIN-001',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-02-01')
      }
    ];
    
    console.log(`✅ Returning ${sampleFeesData.length} sample fee records`);
    
    res.status(200).json({
      status: 'success',
      data: { 
        fees: sampleFeesData,
        count: sampleFeesData.length,
        source: 'sample',
        query: req.query
      }
    });
  } catch (error) {
    console.error('❌ Error fetching public fees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch fees',
      error: error.message
    });
  }
});

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