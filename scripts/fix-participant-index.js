require('dotenv').config();
const mongoose = require('mongoose');
const EventParticipant = require('../models/EventParticipant');

async function fixParticipantIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all indexes
    const indexes = await EventParticipant.collection.getIndexes();
    console.log('📋 Current indexes:', Object.keys(indexes));

    // Drop the old index that uses studentName
    const oldIndexName = 'event_1_studentName_1';
    if (indexes[oldIndexName]) {
      console.log(`🗑️ Dropping old index: ${oldIndexName}`);
      await EventParticipant.collection.dropIndex(oldIndexName);
      console.log('✅ Old index dropped successfully!');
    } else {
      console.log(`ℹ️ Old index ${oldIndexName} not found`);
    }

    // The new index (event_1_studentId_1) will be created automatically when the server restarts
    console.log('ℹ️ New index will be created automatically on server restart');

    // Verify indexes after drop
    const updatedIndexes = await EventParticipant.collection.getIndexes();
    console.log('📋 Updated indexes:', Object.keys(updatedIndexes));

    console.log('✅ Script completed successfully');
    console.log('⚠️ IMPORTANT: Restart your backend server to create the new index');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixParticipantIndex();
