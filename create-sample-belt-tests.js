const mongoose = require('mongoose');
require('dotenv').config();

// Import the BeltTest model
const BeltTest = require('./models/BeltTest');

// Sample belt test data
const sampleBeltTests = [
  {
    studentName: 'Kevin Martinez',
    currentBelt: 'White Belt',
    testingFor: 'Yellow Belt',
    testDate: new Date('2026-02-15'),
    readiness: 85,
    status: 'scheduled',
    notes: 'Student shows good progress in basic techniques. Ready for testing.'
  },
  {
    studentName: 'Rachel Green',
    currentBelt: 'Yellow Belt',
    testingFor: 'Orange Belt',
    testDate: new Date('2026-02-20'),
    readiness: 90,
    status: 'scheduled',
    notes: 'Excellent form execution. Very confident in all requirements.'
  },
  {
    studentName: 'Tom Anderson',
    currentBelt: 'Orange Belt',
    testingFor: 'Green Belt',
    testDate: new Date('2026-02-25'),
    readiness: 75,
    status: 'scheduled',
    notes: 'Good technique but needs more practice on sparring combinations.'
  },
  {
    studentName: 'Nina Patel',
    currentBelt: 'Green Belt',
    testingFor: 'Blue Belt',
    testDate: new Date('2026-03-05'),
    readiness: 95,
    status: 'scheduled',
    notes: 'Outstanding student. Demonstrates leadership qualities.'
  },
  {
    studentName: 'Carlos Rodriguez',
    currentBelt: 'Blue Belt',
    testingFor: 'Purple Belt',
    testDate: new Date('2026-03-10'),
    readiness: 80,
    status: 'scheduled',
    notes: 'Strong in forms, working on flexibility for high kicks.'
  },
  {
    studentName: 'Amy Chen',
    currentBelt: 'Purple Belt',
    testingFor: 'Brown Belt',
    testDate: new Date('2026-03-15'),
    readiness: 88,
    status: 'scheduled',
    notes: 'Advanced techniques mastered. Ready for brown belt level.'
  },
  {
    studentName: 'Michael Johnson',
    currentBelt: 'Brown Belt',
    testingFor: 'Black Belt 1st Dan',
    testDate: new Date('2026-03-25'),
    readiness: 92,
    status: 'scheduled',
    notes: 'Exceptional candidate for black belt. Shows mastery of all areas.'
  },
  {
    studentName: 'Lisa Wang',
    currentBelt: 'White Belt',
    testingFor: 'Yellow Belt',
    testDate: new Date('2026-04-05'),
    readiness: 70,
    status: 'scheduled',
    notes: 'New student with good potential. Needs more practice time.'
  },
  {
    studentName: 'David Kim',
    currentBelt: 'Yellow Belt',
    testingFor: 'Orange Belt',
    testDate: new Date('2026-04-10'),
    readiness: 82,
    status: 'scheduled',
    notes: 'Consistent training and improvement. Good attitude.'
  },
  {
    studentName: 'Sarah Thompson',
    currentBelt: 'Black Belt 1st Dan',
    testingFor: 'Black Belt 2nd Dan',
    testDate: new Date('2026-04-20'),
    readiness: 96,
    status: 'scheduled',
    notes: 'Excellent instructor candidate. Demonstrates advanced skills.'
  }
];

async function createSampleBeltTests() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing belt tests...');
    await BeltTest.deleteMany({});
    console.log('✅ Cleared existing belt tests');

    console.log('📝 Creating sample belt tests...');
    const createdTests = await BeltTest.insertMany(sampleBeltTests);
    console.log(`✅ Created ${createdTests.length} sample belt tests`);

    // Display created belt tests
    console.log('\n📋 Created Belt Tests:');
    createdTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.studentName}`);
      console.log(`   🥋 Testing: ${test.currentBelt} → ${test.testingFor}`);
      console.log(`   📅 Date: ${test.testDate.toLocaleDateString()}`);
      console.log(`   📊 Readiness: ${test.readiness}%`);
      console.log(`   📝 Status: ${test.status}`);
      console.log('');
    });

    console.log('🎉 Sample belt tests created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample belt tests:', error);
    process.exit(1);
  }
}

// Run the script
createSampleBeltTests();