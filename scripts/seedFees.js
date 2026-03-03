const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taekwondo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Define Fee Schema (matching your backend model)
const feeSchema = new mongoose.Schema({
  feeId: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  studentId: { type: String },
  course: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  paidAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Partial', 'Overdue'],
    default: 'Pending'
  },
  paymentMethod: { type: String },
  transactionId: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

const Fee = mongoose.model('Fee', feeSchema);

// Sample fee data
const sampleFees = [
  {
    feeId: 'FEE2025001',
    studentName: 'admin@combatwarrior.com',
    studentId: 'STU-001',
    course: 'Monthly Training Fee',
    amount: 3500,
    dueDate: new Date('2025-03-01'),
    paidDate: new Date('2025-02-28'),
    paidAmount: 3500,
    status: 'Paid',
    paymentMethod: 'Online',
    transactionId: 'TXN001',
    notes: 'February 2025 monthly fee'
  },
  {
    feeId: 'FEE2025002',
    studentName: 'admin@combatwarrior.com',
    studentId: 'STU-001',
    course: 'Belt Test Fee',
    amount: 1800,
    dueDate: new Date('2025-03-15'),
    paidDate: null,
    paidAmount: 0,
    status: 'Pending',
    notes: 'Yellow belt test fee'
  },
  {
    feeId: 'FEE2025003',
    studentName: 'admin@combatwarrior.com',
    studentId: 'STU-001',
    course: 'Equipment Fee',
    amount: 3200,
    dueDate: new Date('2025-03-10'),
    paidDate: new Date('2025-03-01'),
    paidAmount: 1600,
    status: 'Partial',
    paymentMethod: 'Cash',
    notes: 'Uniform and protective gear - partial payment'
  },
  {
    feeId: 'FEE2025004',
    studentName: 'admin@combatwarrior.com',
    studentId: 'STU-001',
    course: 'Competition Fee',
    amount: 2200,
    dueDate: new Date('2025-02-28'),
    paidDate: null,
    paidAmount: 0,
    status: 'Overdue',
    notes: 'State championship registration'
  },
  {
    feeId: 'FEE2025005',
    studentName: 'admin@combatwarrior.com',
    studentId: 'STU-001',
    course: 'Annual Membership',
    amount: 5000,
    dueDate: new Date('2025-04-01'),
    paidDate: null,
    paidAmount: 0,
    status: 'Pending',
    notes: '2025 annual membership fee'
  },
  {
    feeId: 'FEE2025006',
    studentName: 'admin@combatwarrior.com',
    studentId: 'STU-001',
    course: 'Special Training Camp',
    amount: 4500,
    dueDate: new Date('2025-03-20'),
    paidDate: new Date('2025-03-02'),
    paidAmount: 4500,
    status: 'Paid',
    paymentMethod: 'Online',
    transactionId: 'TXN002',
    notes: 'Advanced techniques workshop'
  }
];

// Seed function
async function seedFees() {
  try {
    console.log('🌱 Starting fee data seeding...');
    
    // Clear existing fees (optional - comment out if you want to keep existing data)
    await Fee.deleteMany({});
    console.log('🗑️  Cleared existing fees');
    
    // Insert sample fees
    const result = await Fee.insertMany(sampleFees);
    console.log(`✅ Successfully seeded ${result.length} fee records`);
    
    // Display summary
    console.log('\n📊 Fee Summary:');
    const statusCounts = await Fee.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    statusCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });
    
    const totalAmount = await Fee.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    console.log(`\n💰 Total Amount: ₹${totalAmount[0]?.total || 0}`);
    
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding fees:', error);
    process.exit(1);
  }
}

// Run seeding
seedFees();
