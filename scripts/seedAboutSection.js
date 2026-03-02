const mongoose = require('mongoose');
const AboutSection = require('../models/AboutSection');
require('dotenv').config();

const seedAboutSection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if about section already exists
    const existingSection = await AboutSection.findOne();
    if (existingSection) {
      console.log('ℹ️  About section already exists. Skipping seed.');
      process.exit(0);
    }

    // Create default about section
    const defaultAboutSection = new AboutSection({
      title: 'About Combat Warrior Dojang',
      description: 'Taekwon-Do is a South Korean form of martial arts. It is a combat sport characterised by punching and kicking techniques and was developed during 1940\'s and 1950\'s by Korean Martial artists. The main International Taekwon-Do Federation (ITF), founded by Choi Hong-hi in 1966 and Kukkiwon and World Taekwon-Do Federation (WTF). Taekwon-Do made it\'s Paralympic debut at Tokyo 2020 and is a sport governed by World Taekwon-Do (WT). The goal of this martial art is to give a sense of self-esteem, knowledge of self-defence heightened mental and physical well-being.',
      photo: 'uploads/about/home/default-about.jpg', // You'll need to add a default image
      isActive: true
    });

    await defaultAboutSection.save();
    console.log('✅ Default about section created successfully');
    console.log('📝 Note: Please upload a proper image through the admin panel');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding about section:', error);
    process.exit(1);
  }
};

seedAboutSection();
