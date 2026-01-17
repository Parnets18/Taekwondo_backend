const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create default admin user
    const adminUser = new User({
      name: 'Combat Warrior Admin',
      email: process.env.ADMIN_EMAIL || 'admin@combatwarrior.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      phone: '+919019157225',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Default admin user created successfully');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

module.exports = { createDefaultAdmin };