const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Get all attendance records with filters
exports.getAttendance = async (req, res) => {
  try {
    const { date, startDate, endDate, class: className, status, studentId } = req.query;
    
    let query = {};
    
    // Handle date filtering - support both single date and date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    if (className && className !== 'all') {
      query.class = className;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (studentId) {
      query.student = studentId;
    }
    
    const attendance = await Attendance.find(query)
      .populate('student', 'fullName email beltLevel studentId courseLevel')
      .sort({ date: -1, checkInTime: -1 });
    
    res.status(200).json({
      status: 'success',
      data: { attendance }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// Mark attendance for a student
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, date, checkInTime, status, class: className, notes } = req.body;
    
    if (!studentId || !date || !checkInTime || !className) {
      return res.status(400).json({
        status: 'error',
        message: 'Student ID, date, check-in time, and class are required'
      });
    }
    
    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }
    
    // Check if attendance already exists for this student on this date
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999)
      }
    });
    
    if (existingAttendance) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance already marked for this student today'
      });
    }
    
    const attendance = new Attendance({
      student: studentId,
      studentName: student.fullName,
      date: new Date(date),
      checkInTime: new Date(checkInTime),
      status: status || 'Present',
      class: className,
      notes: notes || '',
      markedBy: req.user?._id
    });
    
    await attendance.save();
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'fullName email beltLevel studentId');
    
    res.status(201).json({
      status: 'success',
      data: { attendance: populatedAttendance }
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

// Update attendance (check-out, status, notes)
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkOutTime, status, notes } = req.body;
    
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }
    
    if (checkOutTime) {
      attendance.checkOutTime = new Date(checkOutTime);
      // Calculate duration in minutes
      const duration = Math.floor((attendance.checkOutTime - attendance.checkInTime) / (1000 * 60));
      attendance.duration = duration;
    }
    
    if (status) {
      attendance.status = status;
    }
    
    if (notes !== undefined) {
      attendance.notes = notes;
    }
    
    await attendance.save();
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'fullName email beltLevel studentId');
    
    res.status(200).json({
      status: 'success',
      data: { attendance: populatedAttendance }
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update attendance',
      error: error.message
    });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete attendance',
      error: error.message
    });
  }
};

// Get attendance statistics
exports.getAttendanceStatistics = async (req, res) => {
  try {
    const { startDate, endDate, class: className } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (className && className !== 'all') {
      query.class = className;
    }
    
    const totalRecords = await Attendance.countDocuments(query);
    const presentCount = await Attendance.countDocuments({ ...query, status: 'Present' });
    const lateCount = await Attendance.countDocuments({ ...query, status: 'Late' });
    const absentCount = await Attendance.countDocuments({ ...query, status: 'Absent' });
    const excusedCount = await Attendance.countDocuments({ ...query, status: 'Excused' });
    
    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayQuery = { date: { $gte: today, $lt: tomorrow } };
    if (className && className !== 'all') {
      todayQuery.class = className;
    }
    
    const todayPresent = await Attendance.countDocuments({ ...todayQuery, status: 'Present' });
    const todayLate = await Attendance.countDocuments({ ...todayQuery, status: 'Late' });
    
    res.status(200).json({
      status: 'success',
      data: {
        totalRecords,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        todayPresent,
        todayLate,
        attendanceRate: totalRecords > 0 ? ((presentCount + lateCount) / totalRecords * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Bulk mark attendance
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { students, date, checkInTime, class: className, status } = req.body;
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Students array is required'
      });
    }
    
    const attendanceRecords = [];
    const errors = [];
    
    for (const studentId of students) {
      try {
        const student = await Student.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }
        
        // Check if attendance already exists
        const existing = await Attendance.findOne({
          student: studentId,
          date: {
            $gte: new Date(date).setHours(0, 0, 0, 0),
            $lte: new Date(date).setHours(23, 59, 59, 999)
          }
        });
        
        if (existing) {
          errors.push({ studentId, error: 'Attendance already marked' });
          continue;
        }
        
        const attendance = new Attendance({
          student: studentId,
          studentName: student.fullName,
          date: new Date(date),
          checkInTime: new Date(checkInTime),
          status: status || 'Present',
          class: className,
          markedBy: req.user?._id
        });
        
        await attendance.save();
        attendanceRecords.push(attendance);
      } catch (error) {
        errors.push({ studentId, error: error.message });
      }
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        marked: attendanceRecords.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Error bulk marking attendance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to bulk mark attendance',
      error: error.message
    });
  }
};
