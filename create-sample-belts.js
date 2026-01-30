const mongoose = require('mongoose');
require('dotenv').config();

// Import the Belt model
const Belt = require('./models/Belt');

// Sample belt data
const sampleBelts = [
  {
    name: 'White Belt',
    level: 1,
    color: 'white',
    hex: '#FFFFFF',
    requirements: ['Basic Stances', 'Basic Blocks', 'Basic Punches'],
    students: 25
  },
  {
    name: 'Yellow Belt',
    level: 2,
    color: 'yellow',
    hex: '#F59E0B',
    requirements: ['Taegeuk Il Jang', 'Front Kick', 'Basic Combinations'],
    students: 20
  },
  {
    name: 'Orange Belt',
    level: 3,
    color: 'orange',
    hex: '#EA580C',
    requirements: ['Taegeuk Ee Jang', 'Side Kick', 'Self Defense Basics'],
    students: 18
  },
  {
    name: 'Green Belt',
    level: 4,
    color: 'green',
    hex: '#10B981',
    requirements: ['Taegeuk Sam Jang', 'Roundhouse Kick', 'Board Breaking'],
    students: 15
  },
  {
    name: 'Blue Belt',
    level: 5,
    color: 'blue',
    hex: '#3B82F6',
    requirements: ['Taegeuk Sa Jang', 'Hook Kick', 'Sparring Basics'],
    students: 12
  },
  {
    name: 'Purple Belt',
    level: 6,
    color: 'purple',
    hex: '#8B5CF6',
    requirements: ['Taegeuk Oh Jang', 'Spinning Kicks', 'Advanced Combinations'],
    students: 10
  },
  {
    name: 'Brown Belt',
    level: 7,
    color: 'brown',
    hex: '#A3A3A3',
    requirements: ['Taegeuk Yuk Jang', 'Jump Kicks', 'Advanced Self Defense'],
    students: 8
  },
  {
    name: 'Red Belt',
    level: 8,
    color: 'red',
    hex: '#EF4444',
    requirements: ['Taegeuk Chil Jang', 'Advanced Techniques', 'Leadership Skills'],
    students: 6
  },
  {
    name: 'Black Belt 1st Dan',
    level: 9,
    color: 'black',
    hex: '#1F2937',
    requirements: ['Koryo', 'All Techniques Mastery', 'Teaching Practice'],
    students: 5
  },
  {
    name: 'Black Belt 2nd Dan',
    level: 10,
    color: 'black',
    hex: '#1F2937',
    requirements: ['Keumgang', 'Advanced Leadership', 'Competition Experience'],
    students: 3
  },
  {
    name: 'Black Belt 3rd Dan',
    level: 11,
    color: 'black',
    hex: '#1F2937',
    requirements: ['Taebaek', 'Master Level Skills', 'Instructor Certification'],
    students: 2
  }
];

async function createSampleBelts() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing belts...');
    await Belt.deleteMany({});
    console.log('✅ Cleared existing belts');

    console.log('🥋 Creating sample belts...');
    const createdBelts = await Belt.insertMany(sampleBelts);
    console.log(`✅ Created ${createdBelts.length} sample belts`);

    // Display created belts
    console.log('\n📋 Created Belts:');
    createdBelts.forEach((belt, index) => {
      console.log(`${index + 1}. ${belt.name}`);
      console.log(`   🎯 Level: ${belt.level}`);
      console.log(`   🎨 Color: ${belt.color} (${belt.hex})`);
      console.log(`   👥 Students: ${belt.students}`);
      console.log(`   📝 Requirements: ${belt.requirements.length} items`);
      console.log('');
    });

    console.log('🎉 Sample belts created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample belts:', error);
    process.exit(1);
  }
}

// Run the script
createSampleBelts();