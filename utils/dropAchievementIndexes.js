const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function dropAchievementIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('achievements');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Drop the problematic id_1 index if it exists
    try {
      await collection.dropIndex('id_1');
      console.log('Successfully dropped id_1 index');
    } catch (error) {
      console.log('id_1 index does not exist or already dropped');
    }

    // List indexes after dropping
    const remainingIndexes = await collection.indexes();
    console.log('Remaining indexes:', remainingIndexes);

    console.log('Index cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropAchievementIndexes();
