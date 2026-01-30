const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: password123');
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Test Student',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890',
      role: 'student',
      isActive: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('👤 Name: Test Student');
    console.log('📱 Phone: 1234567890');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

createTestUser();