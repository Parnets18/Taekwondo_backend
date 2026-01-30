const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample students
    const students = [
      {
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        phone: '1234567890',
        dateOfBirth: new Date('2010-05-15'),
        gender: 'male',
        address: '123 Main St, City',
        emergencyContact: {
          name: 'Jane Smith',
          phone: '0987654321',
          relationship: 'Mother'
        },
        currentBelt: 'white',
        courseLevel: 'beginner',
        studentId: 'TKD001',
        enrollmentDate: new Date('2024-01-15'),
        status: 'active'
      },
      {
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '2345678901',
        dateOfBirth: new Date('2012-08-22'),
        gender: 'female',
        address: '456 Oak Ave, City',
        emergencyContact: {
          name: 'Mike Johnson',
          phone: '1987654321',
          relationship: 'Father'
        },
        currentBelt: 'yellow',
        courseLevel: 'intermediate',
        studentId: 'TKD002',
        enrollmentDate: new Date('2024-02-01'),
        status: 'active'
      },
      {
        fullName: 'Alex Chen',
        email: 'alex.chen@example.com',
        phone: '3456789012',
        dateOfBirth: new Date('2011-12-10'),
        gender: 'male',
        address: '789 Pine St, City',
        emergencyContact: {
          name: 'Lisa Chen',
          phone: '2987654321',
          relationship: 'Mother'
        },
        currentBelt: 'green',
        courseLevel: 'intermediate',
        studentId: 'TKD003',
        enrollmentDate: new Date('2024-01-20'),
        status: 'active'
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log(`✅ Created ${createdStudents.length} students`);

    // Create sample attendance records for the past month
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      for (const student of createdStudents) {
        // 85% chance of attendance
        const willAttend = Math.random() > 0.15;
        
        if (willAttend) {
          const checkInHour = 18 + Math.floor(Math.random() * 2); // 6-7 PM
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
          
          const checkOutTime = new Date(checkInTime);
          checkOutTime.setHours(checkInTime.getHours() + 1, checkInTime.getMinutes() + 30, 0, 0);
          
          // Determine status
          let status = 'Present';
          if (checkInMinute > 15) {
            status = 'Late';
          }
          
          attendanceRecords.push({
            student: student._id,
            studentName: student.fullName,
            date: date,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            status: status,
            class: student.courseLevel === 'beginner' ? 'Beginner Class' : 'Intermediate Class',
            duration: 90, // 1.5 hours
            notes: status === 'Late' ? 'Arrived late due to traffic' : ''
          });
        } else {
          // Mark as absent - don't include checkInTime for absent students
          attendanceRecords.push({
            student: student._id,
            studentName: student.fullName,
            date: date,
            status: 'Absent',
            class: student.courseLevel === 'beginner' ? 'Beginner Class' : 'Intermediate Class',
            notes: 'No show'
          });
        }
      }
    }

    const createdAttendance = await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${createdAttendance.length} attendance records`);

    // Show summary
    const totalStudents = await Student.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    const presentCount = await Attendance.countDocuments({ status: 'Present' });
    const lateCount = await Attendance.countDocuments({ status: 'Late' });
    const absentCount = await Attendance.countDocuments({ status: 'Absent' });

    console.log('\n📊 SAMPLE DATA SUMMARY:');
    console.log(`👥 Students: ${totalStudents}`);
    console.log(`📋 Total Attendance Records: ${totalAttendance}`);
    console.log(`✅ Present: ${presentCount}`);
    console.log(`⏰ Late: ${lateCount}`);
    console.log(`❌ Absent: ${absentCount}`);
    console.log(`📈 Attendance Rate: ${((presentCount + lateCount) / totalAttendance * 100).toFixed(1)}%`);

    console.log('\n🎯 STUDENTS CREATED:');
    createdStudents.forEach(student => {
      console.log(`- ${student.fullName} (${student.studentId}) - ${student.currentBelt} Belt`);
    });

    console.log('\n✅ Sample data creation completed successfully!');
    console.log('📡 MongoDB connection kept open for backend server...');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB due to error');
  }
  // Note: Not disconnecting to keep connection open for backend server
}

createSampleData();