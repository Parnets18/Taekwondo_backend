// Quick test script to check if admission model works
require('dotenv').config();
const mongoose = require('mongoose');
const Admission = require('./models/Admission');

async function testAdmission() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test data matching the form
    const testData = {
      fullName: 'Test Student',
      dateOfBirth: new Date('2000-01-01'),
      gender: 'male',
      phone: '+919876543210',
      email: 'test@example.com',
      address: '123 Test Street, Test Area',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      nationality: 'Indian',
      courseLevel: 'beginner',
      preferredSchedule: 'evening',
      trainingGoals: 'fitness',
      previousMartialArts: 'none',
      fitnessLevel: 'good',
      emergencyContactName: 'Emergency Contact',
      emergencyContactPhone: '+919876543211',
      relationshipToStudent: 'parent',
      emergencyContactAddress: 'Same as student',
      medicalConditions: 'None',
      howDidYouHear: 'website',
      specialRequests: 'None',
      parentGuardianName: 'Parent Name',
      parentGuardianPhone: '+919876543212',
      agreeToTerms: true,
      agreeToPhotos: true,
      agreeToEmails: true
    };

    console.log('\n📝 Creating test admission...');
    const admission = await Admission.create(testData);
    console.log('✅ Admission created successfully!');
    console.log('ID:', admission._id);
    console.log('Name:', admission.fullName);
    console.log('Email:', admission.email);

    // Clean up
    await Admission.deleteOne({ _id: admission._id });
    console.log('🧹 Test admission deleted');

    await mongoose.connection.close();
    console.log('✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.errors) {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
}

testAdmission();
