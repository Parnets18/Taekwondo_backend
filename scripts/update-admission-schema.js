const mongoose = require('mongoose');
require('dotenv').config();

async function updateAdmissionSchema() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop the old Admission collection to reset the schema
    await mongoose.connection.db.dropCollection('admissions').catch(() => {
      console.log('ℹ️  Admissions collection does not exist or already dropped');
    });
    
    console.log('✅ Dropped old admissions collection');
    console.log('✅ New schema will be applied on next admission submission');
    console.log('✅ Schema update complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    process.exit(1);
  }
}

updateAdmissionSchema();
