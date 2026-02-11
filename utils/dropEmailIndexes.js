const mongoose = require('mongoose');

const dropEmailIndexes = async () => {
  try {
    console.log('🔍 Checking for email unique indexes...');
    
    // Check Students collection
    const Student = mongoose.connection.collection('students');
    try {
      const studentIndexes = await Student.indexes();
      const hasEmailIndex = studentIndexes.some(idx => idx.name === 'email_1');
      
      if (hasEmailIndex) {
        await Student.dropIndex('email_1');
        console.log('✅ Dropped email_1 index from students collection');
      } else {
        console.log('✓ No email_1 index in students collection');
      }
    } catch (error) {
      if (error.code !== 27 && !error.message.includes('index not found')) {
        console.log('⚠️  Could not check/drop students email index:', error.message);
      }
    }

    // Check Admissions collection
    const Admission = mongoose.connection.collection('admissions');
    try {
      const admissionIndexes = await Admission.indexes();
      const hasEmailIndex = admissionIndexes.some(idx => idx.name === 'email_1');
      
      if (hasEmailIndex) {
        await Admission.dropIndex('email_1');
        console.log('✅ Dropped email_1 index from admissions collection');
      } else {
        console.log('✓ No email_1 index in admissions collection');
      }
    } catch (error) {
      if (error.code !== 27 && !error.message.includes('index not found')) {
        console.log('⚠️  Could not check/drop admissions email index:', error.message);
      }
    }

    console.log('✅ Email index check completed');
  } catch (error) {
    console.error('❌ Error in dropEmailIndexes:', error.message);
  }
};

module.exports = dropEmailIndexes;
