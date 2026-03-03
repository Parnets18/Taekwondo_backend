const mongoose = require('mongoose');
require('dotenv').config();

const Location = require('./models/Location');

async function testLocation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test location with timings
    const testLocation = new Location({
      name: 'Test Location',
      type: 'location',
      location: 'Test City',
      timings: {
        days: 'Monday to Friday',
        time: '9:00 AM to 5:00 PM'
      }
    });

    await testLocation.save();
    console.log('✅ Test location created:', testLocation);

    // Fetch it back
    const fetched = await Location.findById(testLocation._id);
    console.log('✅ Fetched location:', fetched);
    console.log('✅ Timings:', fetched.timings);

    // Clean up
    await Location.findByIdAndDelete(testLocation._id);
    console.log('✅ Test location deleted');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLocation();
