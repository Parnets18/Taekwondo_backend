const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config();

const sampleCourses = [
  {
    name: 'Foundation Level Taekwon-do',
    level: 'beginner',
    description: 'Perfect entry point for martial arts newcomers. Master fundamental techniques, basic forms, and core principles of traditional Taekwon-do. This comprehensive program builds a solid foundation in discipline, respect, and basic self-defense.',
    duration: {
      months: 3,
      sessionsPerWeek: 3,
      sessionDuration: 60
    },
    fees: {
      registrationFee: 1000,
      monthlyFee: 2000,
      examFee: 500
    },
    curriculum: [
      {
        week: 1,
        topic: 'Introduction to Taekwon-do',
        objectives: ['Learn basic stances', 'Understand dojo etiquette', 'Basic warm-up exercises'],
        techniques: ['Attention stance', 'Ready stance', 'Walking stance']
      },
      {
        week: 2,
        topic: 'Basic Hand Techniques',
        objectives: ['Master basic punches', 'Learn blocking techniques', 'Develop proper form'],
        techniques: ['Straight punch', 'Low block', 'Middle block']
      },
      {
        week: 4,
        topic: 'Basic Kicks',
        objectives: ['Learn front kick', 'Develop balance', 'Improve flexibility'],
        techniques: ['Front snap kick', 'Front rising kick']
      }
    ],
    prerequisites: [],
    ageGroup: {
      min: 6,
      max: 60
    },
    maxStudents: 25,
    currentEnrollment: 18,
    schedule: [
      {
        day: 'monday',
        startTime: '18:00',
        endTime: '19:00'
      },
      {
        day: 'wednesday',
        startTime: '18:00',
        endTime: '19:00'
      },
      {
        day: 'friday',
        startTime: '18:00',
        endTime: '19:00'
      }
    ]
  },
  {
    name: 'Advanced Skills Taekwon-do',
    level: 'intermediate',
    description: 'Elevate your abilities with advanced techniques, competitive sparring, and comprehensive preparation for black belt examinations. Focus on precision, power, and tactical application of martial arts principles.',
    duration: {
      months: 6,
      sessionsPerWeek: 4,
      sessionDuration: 75
    },
    fees: {
      registrationFee: 1500,
      monthlyFee: 3000,
      examFee: 1000
    },
    curriculum: [
      {
        week: 1,
        topic: 'Advanced Hand Techniques',
        objectives: ['Master advanced strikes', 'Learn combination techniques', 'Develop timing'],
        techniques: ['Knife hand strike', 'Ridge hand strike', 'Elbow strikes']
      },
      {
        week: 4,
        topic: 'Advanced Kicking',
        objectives: ['Master high kicks', 'Learn jumping kicks', 'Develop power'],
        techniques: ['Side kick', 'Roundhouse kick', 'Back kick']
      },
      {
        week: 8,
        topic: 'Sparring Fundamentals',
        objectives: ['Learn sparring rules', 'Develop strategy', 'Practice combinations'],
        techniques: ['Distance management', 'Counter attacks', 'Defensive tactics']
      }
    ],
    prerequisites: ['White belt', 'Yellow belt', 'Basic fitness level'],
    ageGroup: {
      min: 10,
      max: 50
    },
    maxStudents: 20,
    currentEnrollment: 15,
    schedule: [
      {
        day: 'monday',
        startTime: '19:15',
        endTime: '20:30'
      },
      {
        day: 'tuesday',
        startTime: '19:15',
        endTime: '20:30'
      },
      {
        day: 'thursday',
        startTime: '19:15',
        endTime: '20:30'
      },
      {
        day: 'saturday',
        startTime: '10:00',
        endTime: '11:15'
      }
    ]
  },
  {
    name: 'Master Level Taekwon-do',
    level: 'advanced',
    description: 'Achieve mastery through advanced techniques, tournament competition, and leadership development within our martial arts community. Prepare for black belt testing and instructor certification.',
    duration: {
      months: 12,
      sessionsPerWeek: 5,
      sessionDuration: 90
    },
    fees: {
      registrationFee: 2000,
      monthlyFee: 4000,
      examFee: 2000
    },
    curriculum: [
      {
        week: 1,
        topic: 'Master Level Forms',
        objectives: ['Perfect advanced patterns', 'Develop flow', 'Master timing'],
        techniques: ['Complex patterns', 'Advanced stances', 'Breathing techniques']
      },
      {
        week: 8,
        topic: 'Competition Preparation',
        objectives: ['Tournament rules', 'Competition strategy', 'Mental preparation'],
        techniques: ['Competition sparring', 'Form competition', 'Breaking techniques']
      },
      {
        week: 16,
        topic: 'Leadership Training',
        objectives: ['Teaching methods', 'Class management', 'Student motivation'],
        techniques: ['Instruction techniques', 'Demonstration skills', 'Safety protocols']
      }
    ],
    prerequisites: ['Green belt or higher', 'Instructor recommendation', 'Physical fitness test'],
    ageGroup: {
      min: 14,
      max: 45
    },
    maxStudents: 15,
    currentEnrollment: 8,
    schedule: [
      {
        day: 'monday',
        startTime: '20:45',
        endTime: '22:15'
      },
      {
        day: 'tuesday',
        startTime: '20:45',
        endTime: '22:15'
      },
      {
        day: 'wednesday',
        startTime: '20:45',
        endTime: '22:15'
      },
      {
        day: 'thursday',
        startTime: '20:45',
        endTime: '22:15'
      },
      {
        day: 'saturday',
        startTime: '11:30',
        endTime: '13:00'
      }
    ]
  },
  {
    name: 'Kids Martial Arts Program',
    level: 'beginner',
    description: 'Specially designed program for young martial artists. Focus on discipline, respect, basic techniques, and character development in a fun and engaging environment.',
    duration: {
      months: 4,
      sessionsPerWeek: 2,
      sessionDuration: 45
    },
    fees: {
      registrationFee: 800,
      monthlyFee: 1500,
      examFee: 300
    },
    curriculum: [
      {
        week: 1,
        topic: 'Fun with Basics',
        objectives: ['Learn through games', 'Build confidence', 'Develop coordination'],
        techniques: ['Basic stances through games', 'Simple blocks', 'Fun exercises']
      },
      {
        week: 4,
        topic: 'Character Building',
        objectives: ['Learn respect', 'Develop discipline', 'Build friendships'],
        techniques: ['Courtesy exercises', 'Team activities', 'Goal setting']
      }
    ],
    prerequisites: [],
    ageGroup: {
      min: 4,
      max: 12
    },
    maxStudents: 15,
    currentEnrollment: 12,
    schedule: [
      {
        day: 'tuesday',
        startTime: '17:00',
        endTime: '17:45'
      },
      {
        day: 'saturday',
        startTime: '09:00',
        endTime: '09:45'
      }
    ]
  }
];

const sampleInstructors = [
  {
    name: 'Master Kim Jong-Su',
    email: 'master.kim@combatwarrior.com',
    password: 'instructor123',
    phone: '+919019157226',
    role: 'instructor'
  },
  {
    name: 'Instructor Sarah Johnson',
    email: 'sarah.johnson@combatwarrior.com',
    password: 'instructor123',
    phone: '+919019157227',
    role: 'instructor'
  },
  {
    name: 'Instructor Raj Patel',
    email: 'raj.patel@combatwarrior.com',
    password: 'instructor123',
    phone: '+919019157228',
    role: 'instructor'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Course.deleteMany({});
    console.log('🗑️ Cleared existing courses');

    // Create instructors
    const instructors = await User.create(sampleInstructors);
    console.log('👨‍🏫 Created sample instructors');

    // Add instructor IDs to courses
    const coursesWithInstructors = sampleCourses.map((course, index) => ({
      ...course,
      instructors: [instructors[index % instructors.length]._id]
    }));

    // Create courses
    const courses = await Course.create(coursesWithInstructors);
    console.log('📚 Created sample courses');

    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${instructors.length} instructors created`);
    console.log(`   • ${courses.length} courses created`);
    
    console.log('\n👨‍🏫 Instructor Accounts:');
    instructors.forEach(instructor => {
      console.log(`   • ${instructor.name}: ${instructor.email} (password: instructor123)`);
    });

    console.log('\n📚 Courses Created:');
    courses.forEach(course => {
      console.log(`   • ${course.name} (${course.level}) - ${course.currentEnrollment}/${course.maxStudents} students`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();