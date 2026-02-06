const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taekwondo';

console.log('🔄 Connecting to MongoDB...');
console.log('📍 URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  createSampleUpcomingTests();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Belt Test Schema
const beltTestSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  currentBelt: {
    type: String,
    required: true
  },
  testingFor: {
    type: String,
    required: true
  },
  testDate: {
    type: Date,
    required: true
  },
  testTime: {
    type: String,
    default: 'TBD'
  },
  location: {
    type: String,
    default: 'Main Dojo'
  },
  examiner: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Postponed'],
    default: 'Scheduled'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  requirements: [{
    type: String
  }],
  testingFee: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Partial'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  readiness: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  results: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    default: null
  },
  passed: {
    type: Boolean,
    default: null
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const BeltTest = mongoose.model('BeltTest', beltTestSchema);

// Sample upcoming tests data
const sampleUpcomingTests = [
  {
    studentId: 'STU-001',
    studentName: 'Golu Vishwakarma',
    currentBelt: 'Red Belt',
    testingFor: '1st Dan Black Belt',
    testDate: new Date('2026-03-15'), // Future date
    testTime: '10:00 AM',
    location: 'Main Dojo',
    examiner: 'Grand Master Kim',
    status: 'Scheduled',
    registrationDate: new Date(),
    requirements: [
      'All Taegeuk forms (1-8)',
      'Advanced breaking techniques',
      'Teaching demonstration',
      'Leadership skills assessment',
      'Physical fitness test'
    ],
    testingFee: 3000,
    paymentStatus: 'Paid',
    notes: 'Exceptional student ready for black belt',
    readiness: 95,
    createdBy: 'ADMIN-001'
  },
  {
    studentId: 'STU-002',
    studentName: 'Priya Sharma',
    currentBelt: 'Blue Belt',
    testingFor: 'Red Belt',
    testDate: new Date('2026-02-28'), // Future date
    testTime: '2:00 PM',
    location: 'Training Hall A',
    examiner: 'Master Lee',
    status: 'Scheduled',
    registrationDate: new Date(),
    requirements: [
      'Taegeuk forms 1-6',
      'Advanced spinning kicks',
      'Tournament sparring',
      'Student mentoring demonstration',
      'Board breaking (3 boards)'
    ],
    testingFee: 1800,
    paymentStatus: 'Paid',
    notes: 'Strong technical skills, good leadership potential',
    readiness: 88,
    createdBy: 'ADMIN-001'
  },
  {
    studentId: 'STU-003',
    studentName: 'Rahul Kumar',
    currentBelt: 'Green Belt',
    testingFor: 'Blue Belt',
    testDate: new Date('2026-02-20'), // Future date
    testTime: '11:00 AM',
    location: 'Main Dojo',
    examiner: 'Master Park',
    status: 'Scheduled',
    registrationDate: new Date(),
    requirements: [
      'Taegeuk forms 1-5',
      'Jump kicks (front, side, roundhouse)',
      'Advanced sparring techniques',
      'Self-defense combinations',
      'Multiple board breaking'
    ],
    testingFee: 1600,
    paymentStatus: 'Pending',
    notes: 'Needs to improve consistency in forms',
    readiness: 75,
    createdBy: 'ADMIN-001'
  },
  {
    studentId: 'STU-004',
    studentName: 'Sneha Singh',
    currentBelt: 'Yellow Belt',
    testingFor: 'Orange Belt',
    testDate: new Date('2026-02-25'), // Future date
    testTime: '3:00 PM',
    location: 'Training Hall B',
    examiner: 'Master Kim',
    status: 'Scheduled',
    registrationDate: new Date(),
    requirements: [
      'Basic stances and blocks',
      'Basic punches and kicks',
      'Taegeuk Il Jang form',
      'Basic sparring techniques',
      'Board breaking (1 board)'
    ],
    testingFee: 1000,
    paymentStatus: 'Paid',
    notes: 'Good progress in basic techniques',
    readiness: 82,
    createdBy: 'ADMIN-001'
  },
  {
    studentId: 'STU-005',
    studentName: 'Amit Patel',
    currentBelt: 'Orange Belt',
    testingFor: 'Green Belt',
    testDate: new Date('2026-03-05'), // Future date
    testTime: '1:00 PM',
    location: 'Main Dojo',
    examiner: 'Master Lee',
    status: 'Scheduled',
    registrationDate: new Date(),
    requirements: [
      'All previous requirements',
      'Advanced kicks and combinations',
      'Taegeuk Sam Jang form',
      'Intermediate sparring',
      'Self-defense techniques'
    ],
    testingFee: 1200,
    paymentStatus: 'Paid',
    notes: 'Excellent form execution and confidence',
    readiness: 90,
    createdBy: 'ADMIN-001'
  }
];

async function createSampleUpcomingTests() {
  try {
    console.log('🔄 Clearing existing belt tests...');
    await BeltTest.deleteMany({});
    console.log('✅ Cleared existing belt tests');

    console.log('🔄 Creating sample upcoming tests...');
    const createdTests = await BeltTest.insertMany(sampleUpcomingTests);
    console.log(`✅ Created ${createdTests.length} sample upcoming tests`);

    console.log('\n📊 Sample Upcoming Tests:');
    createdTests.forEach((test, index) => {
      console.log(`\n${index + 1}. ${test.studentName}`);
      console.log(`   Current Belt: ${test.currentBelt}`);
      console.log(`   Testing For: ${test.testingFor}`);
      console.log(`   Test Date: ${test.testDate.toLocaleDateString('en-GB')}`);
      console.log(`   Test Time: ${test.testTime}`);
      console.log(`   Examiner: ${test.examiner}`);
      console.log(`   Readiness: ${test.readiness}%`);
      console.log(`   Payment: ${test.paymentStatus}`);
      console.log(`   Status: ${test.status}`);
    });

    console.log('\n✅ Sample upcoming tests created successfully!');
    console.log('\n🧪 Test the endpoint:');
    console.log('   curl "http://localhost:5000/api/belts/tests/public?upcoming=true"');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample upcoming tests:', error);
    process.exit(1);
  }
}
