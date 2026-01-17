const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  feeId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'FEE' + Date.now().toString() + Math.random().toString(36).substring(2, 5).toUpperCase();
    }
  },
  studentName: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  feeType: {
    type: String,
    required: true,
    enum: ['Monthly Fee', 'Registration Fee', 'Exam Fee', 'Equipment Fee', 'Late Fee'],
    default: 'Monthly Fee'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'Partial', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'],
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  receiptNumber: {
    type: String,
    default: null
  },
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    reason: {
      type: String,
      default: null
    }
  },
  lateFee: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    appliedDate: {
      type: Date,
      default: null
    }
  },
  notes: {
    type: String,
    default: null
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'],
      required: true
    },
    transactionId: {
      type: String,
      default: null
    },
    paidDate: {
      type: Date,
      required: true
    },
    lateFee: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    discount: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      reason: {
        type: String,
        default: null
      }
    },
    notes: {
      type: String,
      default: null
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalPaidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
feeSchema.index({ studentName: 1, dueDate: 1 });
feeSchema.index({ status: 1, dueDate: 1 });
feeSchema.index({ feeId: 1 });

// Virtual for overdue status
feeSchema.virtual('isOverdue').get(function() {
  return this.status === 'Pending' && new Date() > this.dueDate;
});

// Pre-save middleware to update status based on due date
feeSchema.pre('save', function(next) {
  // Update status based on due date
  if (this.status === 'Pending' && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }
  next();
});

// Method to calculate total amount including late fee and discount
feeSchema.methods.getTotalAmount = function() {
  return this.amount + this.lateFee.amount - this.discount.amount;
};

// Method to calculate remaining amount
feeSchema.methods.getRemainingAmount = function() {
  const totalAmount = this.getTotalAmount();
  return Math.max(0, totalAmount - this.totalPaidAmount);
};

// Method to check if fee is fully paid
feeSchema.methods.isFullyPaid = function() {
  return this.getRemainingAmount() === 0;
};

// Method to add payment and update status
feeSchema.methods.addPayment = function(paymentData) {
  const paymentAmount = paymentData.amount || this.getRemainingAmount();
  
  // Add to payment history
  this.paymentHistory.push({
    amount: paymentAmount,
    paymentMethod: paymentData.paymentMethod,
    transactionId: paymentData.transactionId,
    paidDate: paymentData.paidDate || new Date(),
    lateFee: paymentData.lateFee || { amount: 0 },
    discount: paymentData.discount || { amount: 0 },
    notes: paymentData.notes,
    recordedBy: paymentData.recordedBy,
    recordedAt: new Date()
  });

  // Update total paid amount
  this.totalPaidAmount += paymentAmount;

  // Update status based on payment
  if (this.isFullyPaid()) {
    this.status = 'Paid';
    this.paidDate = paymentData.paidDate || new Date();
    this.paymentMethod = paymentData.paymentMethod;
    this.transactionId = paymentData.transactionId;
  } else {
    this.status = 'Partial';
  }

  // Update latest payment info for backward compatibility
  if (this.paymentHistory.length > 0) {
    const latestPayment = this.paymentHistory[this.paymentHistory.length - 1];
    this.paymentMethod = latestPayment.paymentMethod;
    this.transactionId = latestPayment.transactionId;
    this.paidDate = latestPayment.paidDate;
  }
};

// Method to generate receipt number
feeSchema.methods.generateReceiptNumber = function() {
  if (!this.receiptNumber && (this.status === 'Paid' || this.status === 'Partial')) {
    this.receiptNumber = 'RCP' + Date.now().toString();
  }
  return this.receiptNumber;
};

// Static method to get fee statistics
feeSchema.statics.getStatistics = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        paidAmount: { 
          $sum: { 
            $cond: [
              { $in: ['$status', ['Paid', 'Partial']] }, 
              '$totalPaidAmount', 
              0
            ] 
          } 
        },
        pendingAmount: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0] 
          } 
        },
        overdueAmount: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Overdue'] }, '$amount', 0] 
          } 
        },
        partialAmount: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Partial'] }, { $subtract: ['$amount', '$totalPaidAmount'] }, 0] 
          } 
        },
        totalRecords: { $sum: 1 },
        paidRecords: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] 
          } 
        },
        partialRecords: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Partial'] }, 1, 0] 
          } 
        },
        pendingRecords: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] 
          } 
        },
        overdueRecords: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] 
          } 
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  const stats = result[0] || {
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    partialAmount: 0,
    totalRecords: 0,
    paidRecords: 0,
    partialRecords: 0,
    pendingRecords: 0,
    overdueRecords: 0
  };

  // Calculate combined pending amount (pending + overdue + partial remaining)
  stats.totalPendingAmount = stats.pendingAmount + stats.overdueAmount + stats.partialAmount;

  return stats;
};

module.exports = mongoose.model('Fee', feeSchema);