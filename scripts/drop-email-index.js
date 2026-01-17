require('dotenv').config();
const mongoose = require('mongoose');
const Admission = require('../models/Admission');

async function dropEmailIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all indexes
    const indexes = await Admission.collection.getIndexes();
    console.log('📋 Current indexes:', Object.keys(indexes));

    // Check if email index exists
    if (indexes.email_1) {
      console.log('🗑️ Dropping email_1 index...');
      await Admission.collection.dropIndex('email_1');
      console.log('✅ Email index dropped successfully!');
    } else {
      console.log('ℹ️ No email_1 index found');
    }

    // Verify indexes after drop
    const updatedIndexes = await Admission.collection.getIndexes();
    console.log('📋 Updated indexes:', Object.keys(updatedIndexes));

    console.log('✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropEmailIndex();
