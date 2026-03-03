const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taekwondo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Define Attendance Schema
const attendanceSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: { type: String },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    required: true 
  },
  checkInTime: { type: String },
  checkOutTime: { type: String },
  class: { type: String },
  instructor: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// Generate attendance records for the last 30 days
function generateAttendanceRecords() {
  const records = [];
  const today = new Date();
  const studentName = 'admin@combatwarrior.com';
  const studentId = 'STU-001';
  const classes = ['Beginner Class', 'Intermediate Class', 'Advanced Class', 'Sparring Session'];
  const instructors = ['Master Kim', 'Instructor Lee', 'Coach Park'];
  
  // Generate records for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip Sundays (day 0)
    if (date.getDay() === 0) continue;
    
    // 85% attendance rate
    const isPresent = Math.random() > 0.15;
    
    let status, checkInTime, checkOutTime;
    
    if (isPresent) {
      if (Math.random() > 0.9) {
        status = 'Late';
        checkInTime = '18:15';
      } else {
        status = 'Present';
        checkInTime = '18:00';
      }
      checkOutTime = '19:30';
    } else {
      if (Math.random() > 0.5) {
        status = 'Absent';
      } else {
        status = 'Excused';
      }
      checkInTime = null;
      checkOutTime = null;
    }
    
    records.push({
      studentName,
      studentId,
      date: date,
      status,
      checkInTime,
      checkOutTime,
      class: classes[Math.floor(Math.random() * classes.length)],
      instructor: instructors[Math.floor(Math.random() * instructors.length)],
      notes: status === 'Excused' ? 'Medical appointment' : ''
    });
  }
  
  return records;
}

// Seed function
async function seedAttendance() {
  try {
    console.log('🌱 Starting attendance data seeding...');
    
    // Clear existing attendance (optional)
    await Attendance.deleteMany({});
    console.log('🗑️  Cleared existing attendance records');
    
    // Generate and insert attendance records
    const records = generateAttendanceRecords();
    const result = await Attendance.insertMany(records);
    console.log(`✅ Successfully seeded ${result.length} attendance records`);
    
    // Display summary
    console.log('\n📊 Attendance Summary:');
    const statusCounts = await Attendance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    statusCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });
    
    const totalPresent = statusCounts.find(s => s._id === 'Present')?.count || 0;
    const totalLate = statusCounts.find(s => s._id === 'Late')?.count || 0;
    const totalRecords = result.length;
    const attendanceRate = ((totalPresent + totalLate) / totalRecords * 100).toFixed(1);
    
    console.log(`\n📈 Attendance Rate: ${attendanceRate}%`);
    console.log(`📅 Date Range: ${new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString()} to ${new Date().toLocaleDateString()}`);
    
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding attendance:', error);
    process.exit(1);
  }
}

// Run seeding
seedAttendance();
