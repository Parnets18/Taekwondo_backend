const mongoose = require('mongoose');
require('dotenv').config();

const dropEmailIndex = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check Students collection
    console.log('\n========================================');
    console.log('📋 STUDENTS COLLECTION');
    console.log('========================================');
    const Student = mongoose.connection.collection('students');
    
    console.log('\nCurrent indexes on students collection:');
    const studentIndexes = await Student.indexes();
    studentIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.name);
    });

    // Try to drop the email index if it exists
    try {
      await Student.dropIndex('email_1');
      console.log('\n✅ Successfully dropped email_1 index from students');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('\n✓ email_1 index does not exist in students (this is fine)');
      } else {
        console.log('\n⚠️  Could not drop email_1 from students:', error.message);
      }
    }

    // Check Admissions collection
    console.log('\n========================================');
    console.log('📋 ADMISSIONS COLLECTION');
    console.log('========================================');
    const Admission = mongoose.connection.collection('admissions');
    
    console.log('\nCurrent indexes on admissions collection:');
    const admissionIndexes = await Admission.indexes();
    admissionIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.name);
    });

    // Try to drop the email index if it exists
    try {
      await Admission.dropIndex('email_1');
      console.log('\n✅ Successfully dropped email_1 index from admissions');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('\n✓ email_1 index does not exist in admissions (this is fine)');
      } else {
        console.log('\n⚠️  Could not drop email_1 from admissions:', error.message);
      }
    }

    // Show final state
    console.log('\n========================================');
    console.log('📋 FINAL STATE');
    console.log('========================================');
    
    console.log('\nRemaining indexes in students:');
    const finalStudentIndexes = await Student.indexes();
    finalStudentIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.name);
    });

    console.log('\nRemaining indexes in admissions:');
    const finalAdmissionIndexes = await Admission.indexes();
    finalAdmissionIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.name);
    });

    console.log('\n✅ Script completed successfully');
    console.log('✅ You can now add multiple students/admissions with the same email');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

dropEmailIndex();
