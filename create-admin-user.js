const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the Login model
const Login = require('./models/login.js');

async function createAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await Login.findOne({ email: 'admin@combatwarrior.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      console.log('📧 Email: admin@combatwarrior.com');
      console.log('🔑 Password: admin123');
      
      // Update password if needed
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('🔄 Password updated for admin user');
      
      process.exit(0);
    }

    // Create admin user
    const adminUserData = {
      email: 'admin@combatwarrior.com',
      password: 'admin123'
    };

    console.log('👤 Creating admin user...');
    console.log('📧 Email:', adminUserData.email);
    console.log('🔑 Password:', adminUserData.password);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUserData.password, salt);

    const adminUser = new Login({
      email: adminUserData.email,
      password: hashedPassword
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('🆔 User ID:', adminUser._id);
    console.log('📧 Email: admin@combatwarrior.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('🧪 You can now login with these credentials');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdminUser();