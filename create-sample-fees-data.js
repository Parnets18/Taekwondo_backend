const mongoose = require('mongoose');
const Fee = require('./models/Fee');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/taekwondo_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample fees data
const sampleFeesData = [
  {
    studentName: 'Adarsh Kumar',
    course: 'Advanced',
    feeType: 'Monthly Fee',
    amount: 5000,
    dueDate: new Date('2025-02-15'),
    paidDate: new Date('2025-01-20'),
    status: 'Paid',
    paymentMethod: 'UPI',
    transactionId: 'TXN123456789',
    discount: {
      amount: 500,
      reason: 'Early payment discount'
    },
    lateFee: {
      amount: 0,
      appliedDate: null
    },
    notes: 'Monthly training fee for Advanced Taekwon-Do program',
    paymentHistory: [
      {
        amount: 4500,
        paymentMethod: 'UPI',
        transactionId: 'TXN123456789',
        paidDate: new Date('2025-01-20'),
        lateFee: { amount: 0 },
        discount: { amount: 500, reason: 'Early payment discount' },
        notes: 'Full payment with early discount',
        recordedAt: new Date('2025-01-20')
      }
    ],
    totalPaidAmount: 4500
  },
  {
    studentName: 'Rahul Sharma',
    course: 'Intermediate',
    feeType: 'Monthly Fee',
    amount: 3500,
    dueDate: new Date('2025-02-15'),
    status: 'Pending',
    paymentMethod: null,
    transactionId: null,
    discount: {
      amount: 0,
      reason: null
    },
    lateFee: {
      amount: 0,
      appliedDate: null
    },
    notes: 'Monthly training fee for Intermediate Taekwon-Do program',
    paymentHistory: [],
    totalPaidAmount: 0
  },
  {
    studentName: 'Priya Singh',
    course: 'Beginner',
    feeType: 'Registration Fee',
    amount: 2000,
    dueDate: new Date('2025-01-10'),
    paidDate: new Date('2025-01-08'),
    status: 'Paid',
    paymentMethod: 'Cash',
    transactionId: 'CASH001',
    discount: {
      amount: 200,
      reason: 'New student discount'
    },
    lateFee: {
      amount: 0,
      appliedDate: null
    },
    notes: 'Registration fee for new student enrollment',
    paymentHistory: [
      {
        amount: 1800,
        paymentMethod: 'Cash',
        transactionId: 'CASH001',
        paidDate: new Date('2025-01-08'),
        lateFee: { amount: 0 },
        discount: { amount: 200, reason: 'New student discount' },
        notes: 'Registration payment with new student discount',
        recordedAt: new Date('2025-01-08')
      }
    ],
    totalPaidAmount: 1800
  },
  {
    studentName: 'Amit Patel',
    course: 'Advanced',
    feeType: 'Monthly Fee',
    amount: 5000,
    dueDate: new Date('2025-01-15'),
    paidDate: new Date('2025-01-18'),
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
    transactionId: 'BT789012345',
    discount: {
      amount: 0,
      reason: null
    },
    lateFee: {
      amount: 100,
      appliedDate: new Date('2025-01-16')
    },
    notes: 'Monthly fee with late payment penalty',
    paymentHistory: [
      {
        amount: 5100,
        paymentMethod: 'Bank Transfer',
        transactionId: 'BT789012345',
        paidDate: new Date('2025-01-18'),
        lateFee: { amount: 100 },
        discount: { amount: 0 },
        notes: 'Payment with late fee',
        recordedAt: new Date('2025-01-18')
      }
    ],
    totalPaidAmount: 5100
  },
  {
    studentName: 'Sneha Gupta',
    course: 'Intermediate',
    feeType: 'Monthly Fee',
    amount: 3500,
    dueDate: new Date('2025-01-05'),
    status: 'Overdue',
    paymentMethod: null,
    transactionId: null,
    discount: {
      amount: 0,
      reason: null
    },
    lateFee: {
      amount: 200,
      appliedDate: new Date('2025-01-06')
    },
    notes: 'Overdue monthly fee with late penalty',
    paymentHistory: [],
    totalPaidAmount: 0
  },
  {
    studentName: 'Vikash Kumar',
    course: 'Advanced',
    feeType: 'Exam Fee',
    amount: 1500,
    dueDate: new Date('2025-02-28'),
    status: 'Pending',
    paymentMethod: null,
    transactionId: null,
    discount: {
      amount: 0,
      reason: null
    },
    lateFee: {
      amount: 0,
      appliedDate: null
    },
    notes: 'Black belt examination fee',
    paymentHistory: [],
    totalPaidAmount: 0
  }
];

// Create sample fees data
const createSampleFeesData = async () => {
  try {
    console.log('🔄 Creating sample fees data...');
    
    // Clear existing fees data
    await Fee.deleteMany({});
    console.log('🗑️ Cleared existing fees data');
    
    // Create new fees data
    const createdFees = [];
    
    for (const feeData of sampleFeesData) {
      try {
        const fee = new Fee(feeData);
        
        // Generate receipt number for paid fees
        if (fee.status === 'Paid') {
          fee.generateReceiptNumber();
        }
        
        await fee.save();
        createdFees.push(fee);
        console.log(`✅ Created fee: ${fee.feeId} for ${fee.studentName} (${fee.status})`);
      } catch (error) {
        console.error(`❌ Error creating fee for ${feeData.studentName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully created ${createdFees.length} fee records!`);
    
    // Display summary
    const stats = await Fee.getStatistics();
    console.log('\n📊 Fee Statistics:');
    console.log(`Total Amount: ₹${stats.totalAmount.toLocaleString()}`);
    console.log(`Paid Amount: ₹${stats.paidAmount.toLocaleString()}`);
    console.log(`Pending Amount: ₹${stats.totalPendingAmount.toLocaleString()}`);
    console.log(`Total Records: ${stats.totalRecords}`);
    console.log(`Paid Records: ${stats.paidRecords}`);
    console.log(`Pending Records: ${stats.pendingRecords}`);
    console.log(`Overdue Records: ${stats.overdueRecords}`);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await createSampleFeesData();
  console.log('\n✅ Sample fees data creation completed!');
  console.log('📱 You can now test the fees screen in the React Native app');
  // Keep connection open for testing
  console.log('🔗 MongoDB connection kept open for testing...');
};

main().catch(console.error);