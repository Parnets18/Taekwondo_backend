const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the Login model
const Login = require('./models/login.js');

async function createTestUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await Login.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('⚠️ Test user already exists');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: password123');
      process.exit(0);
    }

    // Create test user
    const testUserData = {
      email: 'test@example.com',
      password: 'password123'
    };

    console.log('👤 Creating test user...');
    console.log('📧 Email:', testUserData.email);
    console.log('🔑 Password:', testUserData.password);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUserData.password, salt);

    const testUser = new Login({
      email: testUserData.email,
      password: hashedPassword
    });

    await testUser.save();

    console.log('✅ Test user created successfully!');
    console.log('🆔 User ID:', testUser._id);
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('');
    console.log('🧪 You can now test login with these credentials');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestUser();