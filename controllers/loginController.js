const Login = require('../models/login.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'default-secret-key-change-this',
    { expiresIn: '7d' }
  );
};

// LOGIN Controller
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // First, try to find user in Login model
    let user = await Login.findOne({ email: email.toLowerCase() });
    let isStudent = false;
    
    console.log('👤 User found in Login model:', !!user);
    
    // If not found in Login model, check Student model
    if (!user) {
      console.log('🔍 Checking Student model...');
      const Student = require('../models/Student');
      const student = await Student.findOne({ email: email.toLowerCase() }).select('+password');
      
      console.log('👨‍🎓 Student found:', !!student);
      
      if (student) {
        console.log('📧 Student email:', student.email);
        console.log('🔑 Student has password:', !!student.password);
        
        // Check if student has a password
        if (!student.password) {
          console.log('❌ Student has no password set');
          return res.status(401).json({
            status: 'error',
            message: 'Password not set for this student. Please contact administrator.'
          });
        }
        
        // Student found, verify password
        console.log('🔐 Comparing passwords...');
        const isMatch = await bcrypt.compare(password, student.password);
        console.log('✅ Password match:', isMatch);
        
        if (!isMatch) {
          console.log('❌ Invalid password for student:', email);
          return res.status(401).json({
            status: 'error',
            message: 'Invalid email or password'
          });
        }
        
        // Student authenticated successfully
        isStudent = true;
        
        // Generate token for student
        const token = generateToken(student._id);
        console.log('✅ Student login successful:', email);
        
        return res.status(200).json({
          status: 'success',
          message: 'Login successful',
          data: {
            token: token,
            user: {
              id: student._id,
              email: student.email,
              name: student.fullName,
              role: 'student',
              studentId: student.studentId,
              admissionNumber: student.admissionNumber,
              currentBeltLevel: student.currentBeltLevel
            }
          }
        });
      }
    }
    
    // If still no user found, return error
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // User found in Login model, verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Login successful:', email);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token: token,
        user: {
          id: user._id,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

// REGISTER Controller (for creating test users)
exports.register = async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body.email);
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await Login.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new Login({
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Registration successful:', email);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        token: token,
        user: {
          id: user._id,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: error.message
    });
  }
};