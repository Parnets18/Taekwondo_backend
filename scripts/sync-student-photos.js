const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Student = require('../models/Student');

async function syncStudentPhotos() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all students
    const students = await Student.find({});
    console.log(`📊 Found ${students.length} students in database`);

    // Get all files in uploads/students directory
    const uploadsDir = path.join(__dirname, '../uploads/students');
    const existingFiles = fs.existsSync(uploadsDir) 
      ? fs.readdirSync(uploadsDir) 
      : [];
    console.log(`📁 Found ${existingFiles.length} files in uploads/students`);

    let fixedCount = 0;
    let missingCount = 0;

    // Check each student
    for (const student of students) {
      if (student.photo) {
        // Extract filename from path (e.g., "uploads/students/photo-xxx.jpg" -> "photo-xxx.jpg")
        const filename = student.photo.split('/').pop();
        
        // Check if file exists
        if (!existingFiles.includes(filename)) {
          console.log(`❌ Missing file for ${student.fullName}: ${filename}`);
          missingCount++;
          
          // Set photo to null since file doesn't exist
          student.photo = null;
          await student.save();
          fixedCount++;
          console.log(`   ✅ Cleared photo reference for ${student.fullName}`);
        } else {
          console.log(`✅ Photo exists for ${student.fullName}: ${filename}`);
        }
      } else {
        console.log(`ℹ️  No photo for ${student.fullName}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total students: ${students.length}`);
    console.log(`   Missing photos: ${missingCount}`);
    console.log(`   Fixed records: ${fixedCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Sync completed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncStudentPhotos();
