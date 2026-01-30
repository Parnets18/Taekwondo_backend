const mongoose = require('mongoose');
require('dotenv').config();

// Import the Promotion model
const Promotion = require('./models/Promotion');

// Sample promotion data
const samplePromotions = [
  {
    studentName: 'John Smith',
    fromBelt: 'White Belt',
    toBelt: 'Yellow Belt',
    promotionDate: new Date('2024-01-15'),
    instructor: 'Master Kim',
    notes: 'Excellent performance in all areas. Great attitude and dedication.',
    certificateIssued: true
  },
  {
    studentName: 'Sarah Johnson',
    fromBelt: 'Yellow Belt',
    toBelt: 'Orange Belt',
    promotionDate: new Date('2024-02-20'),
    instructor: 'Master Lee',
    notes: 'Good technique, needs work on flexibility. Shows great improvement.',
    certificateIssued: true
  },
  {
    studentName: 'Mike Davis',
    fromBelt: 'Orange Belt',
    toBelt: 'Green Belt',
    promotionDate: new Date('2024-03-10'),
    instructor: 'Master Kim',
    notes: 'Outstanding sparring skills. Natural leadership qualities.',
    certificateIssued: true
  },
  {
    studentName: 'Lisa Chen',
    fromBelt: 'Green Belt',
    toBelt: 'Blue Belt',
    promotionDate: new Date('2024-04-05'),
    instructor: 'Master Park',
    notes: 'Perfect form execution. Excellent understanding of techniques.',
    certificateIssued: true
  },
  {
    studentName: 'David Wilson',
    fromBelt: 'Blue Belt',
    toBelt: 'Purple Belt',
    promotionDate: new Date('2024-05-15'),
    instructor: 'Master Lee',
    notes: 'Great leadership potential. Helps other students effectively.',
    certificateIssued: false
  },
  {
    studentName: 'Emma Rodriguez',
    fromBelt: 'Purple Belt',
    toBelt: 'Brown Belt',
    promotionDate: new Date('2024-06-12'),
    instructor: 'Master Kim',
    notes: 'Advanced techniques mastered. Ready for black belt preparation.',
    certificateIssued: false
  },
  {
    studentName: 'Alex Thompson',
    fromBelt: 'Brown Belt',
    toBelt: 'Black Belt 1st Dan',
    promotionDate: new Date('2024-07-25'),
    instructor: 'Grand Master Park',
    notes: 'Exceptional performance. Demonstrates mastery of all requirements.',
    certificateIssued: true
  },
  {
    studentName: 'Maria Garcia',
    fromBelt: 'White Belt',
    toBelt: 'Yellow Belt',
    promotionDate: new Date('2024-08-18'),
    instructor: 'Master Lee',
    notes: 'Quick learner with excellent focus and discipline.',
    certificateIssued: true
  },
  {
    studentName: 'James Brown',
    fromBelt: 'Yellow Belt',
    toBelt: 'Orange Belt',
    promotionDate: new Date('2024-09-22'),
    instructor: 'Master Kim',
    notes: 'Consistent training and improvement. Good sparring technique.',
    certificateIssued: false
  },
  {
    studentName: 'Sophie Miller',
    fromBelt: 'Black Belt 1st Dan',
    toBelt: 'Black Belt 2nd Dan',
    promotionDate: new Date('2024-10-30'),
    instructor: 'Grand Master Park',
    notes: 'Outstanding leadership and teaching abilities. Role model for others.',
    certificateIssued: true
  }
];

async function createSamplePromotions() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing promotions...');
    await Promotion.deleteMany({});
    console.log('✅ Cleared existing promotions');

    console.log('🏆 Creating sample promotions...');
    const createdPromotions = await Promotion.insertMany(samplePromotions);
    console.log(`✅ Created ${createdPromotions.length} sample promotions`);

    // Display created promotions
    console.log('\n📋 Created Promotions:');
    createdPromotions.forEach((promotion, index) => {
      console.log(`${index + 1}. ${promotion.studentName}`);
      console.log(`   🥋 From: ${promotion.fromBelt} → To: ${promotion.toBelt}`);
      console.log(`   📅 Date: ${promotion.promotionDate.toLocaleDateString()}`);
      console.log(`   👨‍🏫 Instructor: ${promotion.instructor}`);
      console.log(`   📜 Certificate: ${promotion.certificateIssued ? 'Issued' : 'Pending'}`);
      console.log('');
    });

    console.log('🎉 Sample promotions created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample promotions:', error);
    process.exit(1);
  }
}

// Run the script
createSamplePromotions();