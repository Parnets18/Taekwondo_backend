const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { validationResult } = require('express-validator');

// Get all fees with filtering and pagination
const getFees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      course,
      month,
      year,
      feeType,
      paymentMethod,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (course) filter.course = course;
    if (feeType) filter.feeType = feeType;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    // Date filtering
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.dueDate = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      filter.dueDate = { $gte: startDate, $lte: endDate };
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { feeId: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const fees = await Fee.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Fee.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get statistics for the filtered data
    const stats = await Fee.getStatistics(filter);

    res.json({
      status: 'success',
      data: {
        fees,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch fees',
      error: error.message
    });
  }
};

// Get fee by ID
const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!fee) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee record not found'
      });
    }

    res.json({
      status: 'success',
      data: { fee }
    });
  } catch (error) {
    console.error('Error fetching fee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch fee record',
      error: error.message
    });
  }
};

// Create new fee record
const createFee = async (req, res) => {
  try {
    console.log('=== CREATE FEE DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request user:', req.user ? req.user.id : 'No user');
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

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

    const feeData = {
      studentName,
      course,
      feeType,
      amount,
      dueDate,
      discount,
      notes
    };
    
    if (req.user && req.user.id) {
      feeData.createdBy = req.user.id;
    }

    console.log('Final fee data to save:', JSON.stringify(feeData, null, 2));

    // Check the Fee model schema
    console.log('Fee model schema paths:', Object.keys(Fee.schema.paths));
    console.log('Fee model required paths:', Fee.schema.requiredPaths());

    const fee = new Fee(feeData);
    console.log('Fee instance created, attempting to save...');
    console.log('Fee instance before save:', JSON.stringify(fee.toObject(), null, 2));
    
    await fee.save();
    console.log('Fee saved successfully with ID:', fee._id);

    const populatedFee = await Fee.findById(fee._id)
      .populate('createdBy', 'name email');

    console.log('Fee populated successfully');

    res.status(201).json({
      status: 'success',
      message: 'Fee record created successfully',
      data: { fee: populatedFee }
    });
  } catch (error) {
    console.error('=== CREATE FEE ERROR ===');
    console.error('Error creating fee:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create fee record',
      error: error.message
    });
  }
};

// Update fee record
const updateFee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee record not found'
      });
    }

    // Don't allow updating paid fees unless it's to add notes
    if (fee.status === 'Paid' && req.body.status !== 'Paid') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot modify paid fee records'
      });
    }

    const updateData = { ...req.body, updatedBy: req.user.id };
    
    const updatedFee = await Fee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('updatedBy', 'name email');

    res.json({
      status: 'success',
      message: 'Fee record updated successfully',
      data: { fee: updatedFee }
    });
  } catch (error) {
    console.error('Error updating fee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update fee record',
      error: error.message
    });
  }
};

// Record payment
const recordPayment = async (req, res) => {
  try {
    console.log('Recording payment - Request body:', req.body);
    console.log('Recording payment - Request params:', req.params);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee record not found'
      });
    }

    const {
      paymentMethod,
      transactionId,
      paidDate,
      lateFee,
      discount,
      notes,
      amount // Allow custom payment amount for partial payments
    } = req.body;

    // Calculate payment amount
    let paymentAmount = amount;
    if (!paymentAmount) {
      // If no amount specified, pay the remaining amount
      paymentAmount = fee.getRemainingAmount();
    }

    // Validate payment amount
    const remainingAmount = fee.getRemainingAmount();
    if (paymentAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment amount must be greater than 0'
      });
    }

    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        status: 'error',
        message: `Payment amount (₹${paymentAmount}) cannot exceed remaining amount (₹${remainingAmount})`
      });
    }

    // Add late fee and discount to the fee record if this is the first payment
    if (fee.paymentHistory.length === 0) {
      if (lateFee && lateFee.amount > 0) {
        fee.lateFee = {
          amount: lateFee.amount,
          appliedDate: new Date()
        };
      }

      if (discount && discount.amount > 0) {
        fee.discount = {
          amount: discount.amount,
          reason: discount.reason || null
        };
      }
    }

    // Add payment using the model method
    fee.addPayment({
      amount: paymentAmount,
      paymentMethod,
      transactionId: transactionId || `${paymentMethod.toUpperCase()}${Date.now()}`,
      paidDate: paidDate || new Date(),
      lateFee,
      discount,
      notes,
      recordedBy: req.user.id
    });

    // Update other fields
    fee.updatedBy = req.user.id;
    if (notes) {
      fee.notes = notes;
    }

    // Generate receipt number
    fee.generateReceiptNumber();

    await fee.save();

    const updatedFee = await Fee.findById(fee._id)
      .populate('updatedBy', 'name email');

    res.json({
      status: 'success',
      message: fee.status === 'Paid' ? 'Payment recorded successfully - Fee fully paid!' : 'Partial payment recorded successfully',
      data: { 
        fee: updatedFee,
        paymentAmount,
        remainingAmount: updatedFee.getRemainingAmount(),
        isFullyPaid: updatedFee.isFullyPaid()
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

// Delete fee record
const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee record not found'
      });
    }

    // Don't allow deleting paid fees
    if (fee.status === 'Paid') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete paid fee records'
      });
    }

    await Fee.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Fee record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete fee record',
      error: error.message
    });
  }
};

// Get fee statistics
const getFeeStatistics = async (req, res) => {
  try {
    const { month, year, course, status } = req.query;
    
    const filter = {};
    if (course) filter.course = course;
    if (status) filter.status = status;
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.dueDate = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      filter.dueDate = { $gte: startDate, $lte: endDate };
    }

    const stats = await Fee.getStatistics(filter);
    
    // Get payment method breakdown
    const paymentMethodStats = await Fee.aggregate([
      { $match: { ...filter, status: 'Paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly trends (last 12 months)
    const monthlyTrends = await Fee.aggregate([
      {
        $match: {
          dueDate: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$dueDate' },
            month: { $month: '$dueDate' }
          },
          totalAmount: { $sum: '$amount' },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        overview: stats,
        paymentMethods: paymentMethodStats,
        monthlyTrends
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get fees for a specific student
const getStudentFees = async (req, res) => {
  try {
    const { studentName } = req.params;
    const { status, limit = 10 } = req.query;

    const filter = { studentName };
    if (status) filter.status = status;

    const fees = await Fee.find(filter)
      .sort({ dueDate: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    const stats = await Fee.getStatistics(filter);

    res.json({
      status: 'success',
      data: {
        fees,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Error fetching student fees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student fees',
      error: error.message
    });
  }
};

// Generate bulk fees for all students
const generateBulkFees = async (req, res) => {
  try {
    const { course, feeType, amount, dueDate } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Get all students for the specified course
    const students = await Student.find({ course });

    if (students.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `No students found for ${course} course`
      });
    }

    const feesToCreate = students.map(student => ({
      studentName: student.name,
      course,
      feeType,
      amount,
      dueDate,
      createdBy: req.user.id
    }));

    const createdFees = await Fee.insertMany(feesToCreate);

    res.status(201).json({
      status: 'success',
      message: `Successfully created ${createdFees.length} fee records`,
      data: {
        count: createdFees.length,
        fees: createdFees
      }
    });
  } catch (error) {
    console.error('Error generating bulk fees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate bulk fees',
      error: error.message
    });
  }
};

module.exports = {
  getFees,
  getFeeById,
  createFee,
  updateFee,
  recordPayment,
  deleteFee,
  getFeeStatistics,
  getStudentFees,
  generateBulkFees
};