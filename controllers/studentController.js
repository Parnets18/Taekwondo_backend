const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

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
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          bloodGroup: student.bloodGroup,
          currentBelt: student.currentBelt,
          enrollmentDate: student.enrollmentDate,
          attendancePercentage: student.attendancePercentage,
          emergencyContact: student.emergencyContact,
          address: student.address,
          photo: student.photo,
          fatherName: student.fatherName,
          motherName: student.motherName,
          fatherPhone: student.fatherPhone,
          motherPhone: student.motherPhone,
          fatherOccupation: student.fatherOccupation,
          motherOccupation: student.motherOccupation,
          schoolCollegeName: student.schoolCollegeName,
          qualification: student.qualification,
          instructorName: student.instructorName,
          classAddress: student.classAddress,
          organizationName: student.organizationName,
          admissionNumber: student.admissionNumber,
          joiningDate: student.joiningDate,
          achievements: student.achievements,
          examYellowStripe: student.examYellowStripe,
          examYellowBelt: student.examYellowBelt,
          examGreenStripe: student.examGreenStripe,
          examGreenBelt: student.examGreenBelt,
          examBlueStripe: student.examBlueStripe,
          examBlueBelt: student.examBlueBelt,
          examRedStripe: student.examRedStripe,
          examRedBelt: student.examRedBelt,
          examBlackStripe: student.examBlackStripe,
          examBlackBelt: student.examBlackBelt,
          currentBeltLevel: student.currentBeltLevel,
          idNumber: student.idNumber,
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
      password,
      address,
      currentBelt = 'white',
      courseLevel,
      feeStructure,
      bloodGroup,
      fatherName,
      motherName,
      fatherPhone,
      motherPhone,
      fatherOccupation,
      motherOccupation,
      schoolCollegeName,
      qualification,
      instructorName,
      classAddress,
      organizationName,
      admissionNumber,
      joiningDate,
      achievements,
      examYellowStripe,
      examYellowBelt,
      examGreenStripe,
      examGreenBelt,
      examBlueStripe,
      examBlueBelt,
      examRedStripe,
      examRedBelt,
      examBlackStripe,
      examBlackBelt,
      currentBeltLevel,
      idNumber
    } = req.body;

    console.log('📋 Extracted required fields:');
    console.log('  fullName:', fullName);
    console.log('  dateOfBirth:', dateOfBirth);
    console.log('  gender:', gender);
    console.log('  phone:', phone);
    console.log('  email:', email);
    console.log('  password:', password ? '***' : 'not provided');
    console.log('  address:', address);
    console.log('  photo file:', req.file);
    console.log('  joiningDate:', joiningDate);
    console.log('  admissionNumber:', admissionNumber);

    // Validate required fields (photo is now optional)
    if (!fullName || !dateOfBirth || !gender || !phone || !email || !password || !address || !joiningDate || !admissionNumber) {
      console.log('❌ Validation failed. Missing required fields');
      return res.status(400).json({
        status: 'error',
        message: 'All required fields must be provided (fullName, dateOfBirth, gender, phone, email, password, address, joiningDate, admissionNumber)',
        missingFields: {
          fullName: !fullName,
          dateOfBirth: !dateOfBirth,
          gender: !gender,
          phone: !phone,
          email: !email,
          password: !password,
          address: !address,
          joiningDate: !joiningDate,
          admissionNumber: !admissionNumber
        }
      });
    }

    // Validate age (must be at least 3 years old)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 3) {
      return res.status(400).json({
        status: 'error',
        message: `Student must be at least 3 years old. Current age: ${age} years. Please check the date of birth.`
      });
    }

    // Generate unique student ID - find the highest existing ID and increment
    const allStudents = await Student.find().select('studentId').lean();
    let studentId;
    
    if (allStudents && allStudents.length > 0) {
      // Extract all numbers and find the maximum
      const numbers = allStudents
        .map(s => {
          const match = s.studentId.match(/STU(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => !isNaN(n));
      
      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      studentId = `STU${String(maxNumber + 1).padStart(4, '0')}`;
    } else {
      // No students exist yet, start with STU0001
      studentId = 'STU0001';
    }
    
    console.log('🆔 Generated student ID:', studentId);

    // Hash password before saving
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Password hashed successfully');

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
    const studentData = {
      studentId,
      userId,
      fullName: fullName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      phone: phone.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      address: address.trim(),
      emergencyContact: { name: '', phone: '', relationship: '' },
      currentBelt,
      photo: req.files && req.files.photo && req.files.photo[0] ? `uploads/students/${req.files.photo[0].filename}` : null,
      aadhar: req.files && req.files.aadhar && req.files.aadhar[0] ? `uploads/students/${req.files.aadhar[0].filename}` : null,
      birthCertificate: req.files && req.files.birthCertificate && req.files.birthCertificate[0] ? `uploads/students/${req.files.birthCertificate[0].filename}` : null,
      joiningDate: new Date(joiningDate),
      admissionNumber: admissionNumber.trim(),
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
    };

    // Add optional fields if provided
    if (bloodGroup) studentData.bloodGroup = bloodGroup;
    if (fatherName) studentData.fatherName = fatherName.trim();
    if (motherName) studentData.motherName = motherName.trim();
    if (fatherPhone) studentData.fatherPhone = fatherPhone.trim();
    if (motherPhone) studentData.motherPhone = motherPhone.trim();
    if (fatherOccupation) studentData.fatherOccupation = fatherOccupation.trim();
    if (motherOccupation) studentData.motherOccupation = motherOccupation.trim();
    if (schoolCollegeName) studentData.schoolCollegeName = schoolCollegeName.trim();
    if (qualification) studentData.qualification = qualification.trim();
    if (instructorName) studentData.instructorName = instructorName.trim();
    if (classAddress) studentData.classAddress = classAddress.trim();
    if (organizationName) studentData.organizationName = organizationName.trim();

    // Add achievements if provided
    if (achievements) {
      try {
        const achievementsArray = typeof achievements === 'string' ? JSON.parse(achievements) : achievements;
        if (Array.isArray(achievementsArray) && achievementsArray.length > 0) {
          studentData.achievements = achievementsArray.map((ach, achIndex) => {
            const achievement = {
              tournamentName: ach.tournamentName || '',
              address: ach.address || '',
              date: ach.date ? new Date(ach.date) : null,
              type: ach.type || '',
              prize: ach.prize || ''
            };
            
            // Handle typePrices with certificate files
            if (ach.typePrices && Array.isArray(ach.typePrices)) {
              achievement.typePrices = ach.typePrices.map((tp, tpIndex) => {
                const typePrice = {
                  type: tp.type || '',
                  price: tp.price || '',
                  certificateCode: tp.certificateCode || ''
                };
                
                // Check if there's a certificate file uploaded
                const certFileKey = `certificate_${achIndex}_${tpIndex}`;
                if (req.files && req.files[certFileKey] && req.files[certFileKey][0]) {
                  // Save only the relative path
                  const file = req.files[certFileKey][0];
                  typePrice.certificateFile = `uploads/students/${file.filename}`;
                } else if (tp.certificateFile && typeof tp.certificateFile === 'string' && !tp.certificateFile.startsWith('certificate_')) {
                  // Keep existing certificate file path
                  typePrice.certificateFile = tp.certificateFile;
                } else {
                  typePrice.certificateFile = '';
                }
                
                return typePrice;
              });
            }
            
            return achievement;
          });
        }
      } catch (error) {
        console.log('Error parsing achievements:', error);
      }
    }

    // Add exam dates if provided
    if (examYellowStripe) studentData.examYellowStripe = new Date(examYellowStripe);
    if (examYellowBelt) studentData.examYellowBelt = new Date(examYellowBelt);
    if (examGreenStripe) studentData.examGreenStripe = new Date(examGreenStripe);
    if (examGreenBelt) studentData.examGreenBelt = new Date(examGreenBelt);
    if (examBlueStripe) studentData.examBlueStripe = new Date(examBlueStripe);
    if (examBlueBelt) studentData.examBlueBelt = new Date(examBlueBelt);
    if (examRedStripe) studentData.examRedStripe = new Date(examRedStripe);
    if (examRedBelt) studentData.examRedBelt = new Date(examRedBelt);
    if (examBlackStripe) studentData.examBlackStripe = new Date(examBlackStripe);
    if (examBlackBelt) studentData.examBlackBelt = new Date(examBlackBelt);
    if (currentBeltLevel) studentData.currentBeltLevel = currentBeltLevel.trim();
    if (idNumber) studentData.idNumber = idNumber.trim();

    const student = new Student(studentData);

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
      // Check which field caused the duplicate
      if (error.message.includes('email')) {
        errorMessage = 'A student with this email already exists. Please use a different email address.';
      } else if (error.message.includes('studentId')) {
        errorMessage = 'Student ID conflict. Please try again.';
      } else {
        errorMessage = 'A student with this information already exists.';
      }
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
    console.log('📝 Update student request received for ID:', req.params.id);
    console.log('📦 Request body:', req.body);
    
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.studentId;
    delete updates.userId;
    delete updates.admissionId;
    delete updates.createdAt;

    // Handle password update
    if (updates.password && updates.password.trim() !== '') {
      console.log('🔐 Hashing new password...');
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
      console.log('✅ Password hashed successfully');
    } else {
      // Remove password field if empty (don't update password)
      delete updates.password;
    }

    // Add photo path if file was uploaded
    if (req.files && req.files.photo && req.files.photo[0]) {
      updates.photo = `uploads/students/${req.files.photo[0].filename}`;
      console.log('📷 New photo uploaded:', updates.photo);
    }

    // Add aadhar path if file was uploaded
    if (req.files && req.files.aadhar && req.files.aadhar[0]) {
      updates.aadhar = `uploads/students/${req.files.aadhar[0].filename}`;
      console.log('🆔 New aadhar uploaded:', updates.aadhar);
    }

    // Add birth certificate path if file was uploaded
    if (req.files && req.files.birthCertificate && req.files.birthCertificate[0]) {
      updates.birthCertificate = `uploads/students/${req.files.birthCertificate[0].filename}`;
      console.log('📜 New birth certificate uploaded:', updates.birthCertificate);
    }

    // Parse achievements if it's a string
    if (updates.achievements) {
      if (typeof updates.achievements === 'string') {
        try {
          updates.achievements = JSON.parse(updates.achievements);
          console.log('✅ Parsed achievements:', updates.achievements);
        } catch (error) {
          console.log('❌ Error parsing achievements:', error);
          delete updates.achievements; // Remove invalid achievements
        }
      }
      
      // Process achievements with certificate files
      if (Array.isArray(updates.achievements)) {
        updates.achievements = updates.achievements.map((ach, achIndex) => {
          const achievement = {
            tournamentName: ach.tournamentName || '',
            address: ach.address || '',
            date: ach.date ? new Date(ach.date) : null,
            type: ach.type || '',
            prize: ach.prize || ''
          };
          
          // Handle typePrices with certificate files
          if (ach.typePrices && Array.isArray(ach.typePrices)) {
            achievement.typePrices = ach.typePrices.map((tp, tpIndex) => {
              const typePrice = {
                type: tp.type || '',
                price: tp.price || '',
                certificateCode: tp.certificateCode || ''
              };
              
              // Check if there's a certificate file uploaded
              const certFileKey = `certificate_${achIndex}_${tpIndex}`;
              if (req.files && req.files[certFileKey] && req.files[certFileKey][0]) {
                // Save only the relative path
                const file = req.files[certFileKey][0];
                typePrice.certificateFile = `uploads/students/${file.filename}`;
              } else if (tp.certificateFile && typeof tp.certificateFile === 'string' && !tp.certificateFile.startsWith('certificate_')) {
                // Keep existing certificate file path
                typePrice.certificateFile = tp.certificateFile;
              } else {
                typePrice.certificateFile = '';
              }
              
              return typePrice;
            });
          }
          
          return achievement;
        });
        
        // Filter out empty achievements
        updates.achievements = updates.achievements.filter(ach => 
          ach.tournamentName || ach.address || ach.date || ach.type || ach.prize
        );
        
        // If all achievements are empty, set to empty array
        if (updates.achievements.length === 0) {
          updates.achievements = [];
        }
      }
    }

    // Convert date strings to Date objects
    const dateFields = [
      'dateOfBirth', 'joiningDate', 'enrollmentDate',
      'examYellowStripe', 'examYellowBelt', 'examGreenStripe', 'examGreenBelt',
      'examBlueStripe', 'examBlueBelt', 'examRedStripe', 'examRedBelt',
      'examBlackStripe', 'examBlackBelt'
    ];
    
    dateFields.forEach(field => {
      if (updates[field] && typeof updates[field] === 'string') {
        updates[field] = new Date(updates[field]);
      }
    });

    // Update the updatedAt field
    updates.updatedAt = new Date();

    console.log('💾 Attempting to update student...');
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!student) {
      console.log('❌ Student not found');
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    console.log('✅ Student updated successfully');

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
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          bloodGroup: student.bloodGroup,
          currentBelt: student.currentBelt,
          address: student.address,
          emergencyContact: student.emergencyContact,
          enrollmentDate: student.enrollmentDate,
          photo: student.photo,
          fatherName: student.fatherName,
          motherName: student.motherName,
          fatherPhone: student.fatherPhone,
          motherPhone: student.motherPhone,
          fatherOccupation: student.fatherOccupation,
          motherOccupation: student.motherOccupation,
          schoolCollegeName: student.schoolCollegeName,
          qualification: student.qualification,
          instructorName: student.instructorName,
          classAddress: student.classAddress,
          organizationName: student.organizationName,
          admissionNumber: student.admissionNumber,
          joiningDate: student.joiningDate,
          achievements: student.achievements,
          examYellowStripe: student.examYellowStripe,
          examYellowBelt: student.examYellowBelt,
          examGreenStripe: student.examGreenStripe,
          examGreenBelt: student.examGreenBelt,
          examBlueStripe: student.examBlueStripe,
          examBlueBelt: student.examBlueBelt,
          examRedStripe: student.examRedStripe,
          examRedBelt: student.examRedBelt,
          examBlackStripe: student.examBlackStripe,
          examBlackBelt: student.examBlackBelt,
          currentBeltLevel: student.currentBeltLevel,
          idNumber: student.idNumber,
          updatedAt: student.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Update student error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    let errorMessage = 'Error updating student';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = 'A student with this information already exists.';
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
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

// @desc    Get upcoming birthdays
// @route   GET /api/students/birthdays
// @access  Public
const getUpcomingBirthdays = async (req, res) => {
  try {
    console.log('🎂 === BIRTHDAY ENDPOINT CALLED ===');
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();
    
    console.log('📅 Current date:', today.toISOString());
    console.log('📅 Current month:', currentMonth, 'Current day:', currentDay, 'Current year:', currentYear);
    
    // Get ALL students (not just active) to debug
    const students = await Student.find({});
    console.log('👥 Total students found:', students.length);
    
    // Filter students who have a dateOfBirth
    const studentsWithBirthday = students.filter(s => s.dateOfBirth);
    console.log('🎂 Students with dateOfBirth:', studentsWithBirthday.length);
    
    // Log first few students with their birthdays
    studentsWithBirthday.slice(0, 10).forEach(student => {
      console.log(`  - ${student.fullName}: DOB = ${student.dateOfBirth}, Status = ${student.status}`);
    });
    
    // Filter students with birthdays in current month or next month
    const upcomingBirthdays = studentsWithBirthday
      .map(student => {
        const birthDate = new Date(student.dateOfBirth);
        const birthMonth = birthDate.getMonth() + 1;
        const birthDay = birthDate.getDate();
        
        // Calculate days until birthday this year
        const thisYearBirthday = new Date(currentYear, birthMonth - 1, birthDay);
        let daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
        
        // If birthday has passed this year, calculate for next year
        if (daysUntil < 0) {
          const nextYearBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
          daysUntil = Math.ceil((nextYearBirthday - today) / (1000 * 60 * 60 * 24));
        }
        
        console.log(`  🎂 ${student.fullName}: ${birthMonth}/${birthDay} - ${daysUntil} days until birthday`);
        
        return {
          _id: student._id,
          fullName: student.fullName,
          photo: student.photo,
          currentBelt: student.currentBeltLevel || student.currentBelt,
          dateOfBirth: student.dateOfBirth,
          birthMonth,
          birthDay,
          daysUntil,
          isToday: daysUntil === 0,
          isTomorrow: daysUntil === 1,
          isThisMonth: birthMonth === currentMonth,
          isNextMonth: birthMonth === (currentMonth === 12 ? 1 : currentMonth + 1)
        };
      })
      .filter(student => {
        // Show birthdays within next 120 days (approximately 4 months)
        const isWithin120Days = student.daysUntil <= 120;
        if (isWithin120Days) {
          console.log(`  ✅ Including ${student.fullName} (${student.daysUntil} days)`);
        }
        return isWithin120Days;
      })
      .sort((a, b) => a.daysUntil - b.daysUntil); // Sort by closest birthday first
    
    console.log('🎉 Total birthdays within 120 days:', upcomingBirthdays.length);
    
    res.status(200).json({
      status: 'success',
      count: upcomingBirthdays.length,
      data: upcomingBirthdays
    });
  } catch (error) {
    console.error('❌ Get birthdays error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching birthdays',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getUpcomingBirthdays
};