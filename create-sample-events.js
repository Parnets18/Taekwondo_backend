const mongoose = require('mongoose');
require('dotenv').config();

// Import the Event model
const Event = require('./models/Event');

// Sample events data
const sampleEvents = [
  // Past Events (2024)
  {
    name: 'Karnataka State Taekwondo Championship 2024',
    description: 'Annual state level Taekwondo championship for all belt categories.',
    date: new Date('2024-03-15'),
    startTime: '09:00',
    endTime: '17:00',
    location: 'Bangalore Sports Complex, Koramangala',
    eventType: 'Tournament',
    level: 'All Levels',
    maxParticipants: 200,
    registrationFee: 500,
    status: 'Completed'
  },
  {
    name: 'Dan & Kup Belt Grading Examination',
    description: 'Quarterly belt promotion examination for Taekwondo practitioners.',
    date: new Date('2024-04-20'),
    startTime: '10:00',
    endTime: '15:00',
    location: 'Main Dojo, Mysore Road',
    eventType: 'Grading',
    level: 'Intermediate',
    maxParticipants: 50,
    registrationFee: 1000,
    status: 'Completed'
  },
  {
    name: 'Summer Training Camp 2024',
    description: 'Intensive summer training camp for all levels.',
    date: new Date('2024-05-10'),
    startTime: '08:00',
    endTime: '16:00',
    location: 'Coorg Training Center',
    eventType: 'Training Camp',
    level: 'All Levels',
    maxParticipants: 80,
    registrationFee: 1500,
    status: 'Completed'
  },
  
  // Upcoming Events (2026)
  {
    name: 'New Year Taekwondo Grand Prix 2026',
    description: 'Grand New Year Taekwondo championship with international participants.',
    date: new Date('2026-01-25'),
    startTime: '08:00',
    endTime: '18:00',
    location: 'Bangalore International Stadium',
    eventType: 'Tournament',
    level: 'All Levels',
    maxParticipants: 300,
    registrationFee: 750,
    registrationDeadline: new Date('2026-01-20'),
    status: 'Upcoming'
  },
  {
    name: 'Youth Taekwondo Development Seminar',
    description: 'Special seminar focused on youth development in Taekwondo martial arts.',
    date: new Date('2026-02-15'),
    startTime: '14:00',
    endTime: '18:00',
    location: 'Youth Center, Mysore',
    eventType: 'Seminar',
    level: 'Beginner',
    maxParticipants: 80,
    registrationFee: 200,
    registrationDeadline: new Date('2026-02-10'),
    status: 'Upcoming'
  },
  {
    name: 'Inter-School Taekwondo Championship',
    description: 'Annual inter-school Taekwondo championship with forms and sparring.',
    date: new Date('2026-02-28'),
    startTime: '08:00',
    endTime: '16:00',
    location: 'School Sports Complex, Hubli',
    eventType: 'Competition',
    level: 'Intermediate',
    maxParticipants: 150,
    registrationFee: 300,
    registrationDeadline: new Date('2026-02-25'),
    status: 'Upcoming'
  },
  {
    name: 'Black Belt Master Class Training',
    description: 'Intensive advanced Taekwondo training for black belt holders.',
    date: new Date('2026-03-05'),
    startTime: '09:00',
    endTime: '17:00',
    location: 'Advanced Training Center, Bangalore',
    eventType: 'Training Camp',
    level: 'Black Belt',
    maxParticipants: 30,
    registrationFee: 2500,
    registrationDeadline: new Date('2026-03-01'),
    status: 'Upcoming'
  },
  {
    name: 'Spring Tournament 2026',
    description: 'Spring season Taekwondo tournament for all categories.',
    date: new Date('2026-04-12'),
    startTime: '09:00',
    endTime: '17:00',
    location: 'Mysore Sports Arena',
    eventType: 'Tournament',
    level: 'All Levels',
    maxParticipants: 200,
    registrationFee: 600,
    registrationDeadline: new Date('2026-04-08'),
    status: 'Upcoming'
  }
];

async function createSampleEvents() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing events...');
    await Event.deleteMany({});
    console.log('✅ Cleared existing events');

    console.log('📅 Creating sample events...');
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`✅ Created ${createdEvents.length} sample events`);

    // Display created events
    console.log('\n📋 Created Events:');
    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   📅 Date: ${event.date.toLocaleDateString()}`);
      console.log(`   📍 Location: ${event.location}`);
      console.log(`   🎯 Level: ${event.level}`);
      console.log(`   📊 Status: ${event.status}`);
      console.log(`   👥 Max Participants: ${event.maxParticipants}`);
      console.log('');
    });

    console.log('🎉 Sample events created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample events:', error);
    process.exit(1);
  }
}

// Run the script
createSampleEvents();