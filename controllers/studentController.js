const Student = require('../models/Student');

// @desc    Get all students with filtering and pagination
// @route   GET /api/students
// @access  Private (Admin/Staff)
const getStudents = async (req, res) => {
  console.log('🔍 getStudents called with query:', req.query);
  try {
    const { 
      status, 
      courseLevel, 
      currentBelt, 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'enrollmentDate',
      sortOrder = 'desc'
    } = req.query;

    console.log('�️ Usibng database mode');
    
    const filter = {};
    if (status) filter.status = status;
    if (courseLevel) filter.courseLevel = courseLevel;
    if (currentBelt) filter.currentBelt = currentBelt;
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get students with pagination
    const students = await Student.find(filter)
      .populate('userId', 'name email lastLogin')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(filter);

    // Calculate statistics
    const stats = {
      total: await Student.countDocuments(),
      active: await Student.countDocuments({ status: 'active' }),
      blackBelts: await Student.countDocuments({ 
        currentBelt: { $in: ['black-1st', 'black-2nd', 'black-3rd'] } 
      }),
      newThisMonth: await Student.countDocuments({
        enrollmentDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    };

    res.status(200).json({
      status: 'success',
      data: {
        students: students.map(student => ({
          id: student._id,
          studentId: student.studentId,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          age: student.age,
          currentBelt: student.currentBelt,
          courseLevel: student.courseLevel,
          status: student.status,
          enrollmentDate: student.enrollmentDate,
          attendancePercentage: student.attendancePercentage,
          emergencyContact: student.emergencyContact,
          address: student.address,
          user: student.userId
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats
      }
    });

  } catch (error) {
    console.error('❌ Get students error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single student details
// @route   GET /api/students/:id
// @access  Private (Admin/Staff)
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email phone lastLogin')
      .populate('admissionId')
      .populate('beltHistory.examiner', 'name')
      .populate('skillAssessments.assessor', 'name');

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        student: {
          ...student.toObject(),
          age: student.age,
          attendancePercentage: student.attendancePercentage
        }
      }
    });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching student details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin/Staff)
const createStudent = async (req, res) => {
  try {
    console.log('📝 Create student request received');
    console.log('📦 Request body:', req.body);
    
    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB is not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({
        status: 'error',
        message: 'Database connection is not available. Please check MongoDB connection and IP whitelist settings.',
        details: 'The server cannot connect to MongoDB Atlas. This is usually due to IP whitelist restrictions.'
      });
    }
    
    const {
      fullName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      emergencyContact,
      currentBelt = 'white',
      courseLevel,
      feeStructure
    } = req.body;

    // Validate required fields
    if (!fullName || !dateOfBirth || !gender || !phone || !email || !address || !emergencyContact || !courseLevel) {
      console.log('❌ Validation failed. Missing fields:');
      console.log('  fullName:', fullName);
      console.log('  dateOfBirth:', dateOfBirth);
      console.log('  gender:', gender);
      console.log('  phone:', phone);
      console.log('  email:', email);
      console.log('  address:', address);
      console.log('  emergencyContact:', emergencyContact);
      console.log('  courseLevel:', courseLevel);
      return res.status(400).json({
        status: 'error',
        message: 'All required fields must be provided'
      });
    }

    // Validate age (must be at least 5 years old)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 5) {
      return res.status(400).json({
        status: 'error',
        message: `Student must be at least 5 years old. Current age: ${age} years. Please check the date of birth.`
      });
    }

    // Generate unique student ID - find the highest existing ID and increment
    const lastStudent = await Student.findOne().sort({ studentId: -1 }).select('studentId');
    let studentId;
    
    if (lastStudent && lastStudent.studentId) {
      // Extract number from last student ID (e.g., "STU0001" -> 1)
      const lastNumber = parseInt(lastStudent.studentId.replace('STU', ''));
      studentId = `STU${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      // No students exist yet, start with STU0001
      studentId = 'STU0001';
    }
    
    console.log('🆔 Generated student ID:', studentId);

    // Create user account for student (optional) - SKIP for now to avoid phone validation issues
    let userId = null;
    // Commenting out user creation to avoid validation errors
    /*
    try {
      const User = require('../models/User');
      const user = new User({
        name: fullName,
        email: email.toLowerCase(),
        phone,
        role: 'student',
        password: 'defaultPassword123' // Should be changed on first login
      });
      const savedUser = await user.save();
      userId = savedUser._id;
    } catch (userError) {
      console.log('User creation failed, continuing without user account:', userError.message);
    }
    */

    // Create student record
    const student = new Student({
      studentId,
      userId,
      fullName: fullName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      address: address.trim(),
      emergencyContact: {
        name: emergencyContact.name.trim(),
        phone: emergencyContact.phone.trim(),
        relationship: emergencyContact.relationship.trim()
      },
      currentBelt,
      courseLevel,
      feeStructure: feeStructure || {
        monthlyFee: 2000,
        registrationFee: 1000,
        examFee: 500
      },
      beltHistory: [{
        belt: currentBelt,
        awardedDate: new Date(),
        notes: 'Initial belt assignment'
      }]
    });

    console.log('💾 Attempting to save student to database...');
    const savedStudent = await student.save();
    console.log('✅ Student saved successfully:', savedStudent.studentId);

    res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: {
        student: {
          id: savedStudent._id,
          studentId: savedStudent.studentId,
          fullName: savedStudent.fullName,
          email: savedStudent.email,
          phone: savedStudent.phone,
          age: savedStudent.age,
          currentBelt: savedStudent.currentBelt,
          courseLevel: savedStudent.courseLevel,
          status: savedStudent.status,
          enrollmentDate: savedStudent.enrollmentDate
        }
      }
    });

  } catch (error) {
    console.error('❌ Create student error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Error creating student';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = 'A student with this email already exists';
      statusCode = 400;
    } else if (error.message.includes('buffering timed out')) {
      errorMessage = 'Database connection timeout. Please check MongoDB connection.';
      statusCode = 503;
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update student information
// @route   PUT /api/students/:id
// @access  Private (Admin/Staff)
const updateStudent = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.studentId;
    delete updates.userId;
    delete updates.admissionId;
    delete updates.createdAt;

    // Update the updatedAt field
    updates.updatedAt = new Date();

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Student updated successfully',
      data: {
        student: {
          id: student._id,
          studentId: student.studentId,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          age: student.age,
          currentBelt: student.currentBelt,
          courseLevel: student.courseLevel,
          status: student.status,
          address: student.address,
          emergencyContact: student.emergencyContact,
          enrollmentDate: student.enrollmentDate,
          updatedAt: student.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
// @desc    Delete student (hard delete)
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Hard delete - permanently remove from database
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Student permanently deleted from database'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
};