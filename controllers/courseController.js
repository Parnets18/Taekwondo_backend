const Course = require('../models/Course');
const Student = require('../models/Student');

// @desc    Get all courses with stats
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      level = '', 
      isActive = true 
    } = req.query;

    // Build filter object - fix the isActive filter
    const filter = {};
    
    // Only filter by isActive if it's explicitly set to false
    if (isActive === 'false') {
      filter.isActive = false;
    } else {
      // Default to showing active courses, but don't filter if not specified
      filter.isActive = true;
    }
    
    if (level) filter.level = level;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get courses with pagination
    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(filter);
    
    // Calculate stats
    const stats = {
      total: await Course.countDocuments({ isActive: true }),
      active: await Course.countDocuments({ isActive: true }),
      totalEnrollment: await Course.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$currentEnrollment' } } }
      ]).then(result => result[0]?.total || 0),
      monthlyRevenue: await Course.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$currentEnrollment', '$fees.monthlyFee'] } } } }
      ]).then(result => result[0]?.total || 0)
    };

    // Format courses for frontend
    const formattedCourses = courses.map(course => ({
      id: course._id,
      title: course.name,
      ageGroup: `${course.ageGroup.min}-${course.ageGroup.max} Years`,
      duration: `${course.duration.sessionDuration} Minutes`,
      schedule: course.schedule || 'Mon, Wed, Fri - 6:00 PM',
      price: course.fees.monthlyFee,
      currentStudents: course.currentEnrollment,
      description: course.description,
      features: course.curriculum.map(c => c.topic),
      status: course.isActive ? 'active' : 'inactive',
      category: course.level,
      enrollmentDate: course.createdAt
    }));

    res.status(200).json({
      status: 'success',
      data: {
        courses: formattedCourses,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCourses / parseInt(limit)),
          totalItems: totalCourses,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching courses'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    const formattedCourse = {
      id: course._id,
      title: course.name,
      ageGroup: `${course.ageGroup.min}-${course.ageGroup.max} Years`,
      duration: `${course.duration.sessionDuration} Minutes`,
      schedule: course.schedule || 'Mon, Wed, Fri - 6:00 PM',
      price: course.fees.monthlyFee,
      currentStudents: course.currentEnrollment,
      description: course.description,
      features: course.curriculum.map(c => c.topic),
      status: course.isActive ? 'active' : 'inactive',
      category: course.level
    };

    res.status(200).json({
      status: 'success',
      data: { course: formattedCourse }
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching course details'
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin/Staff)
const createCourse = async (req, res) => {
  try {
    const {
      title,
      ageGroup,
      duration,
      schedule,
      price,
      category,
      description,
      features
    } = req.body;

    // Validate required fields
    if (!title || !category || !description || !price) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: title, category, description, and price are required'
      });
    }

    // Simple course data with minimal parsing
    const courseData = {
      name: title.trim(),
      level: category,
      description: description.trim(),
      duration: {
        months: 12,
        sessionsPerWeek: 3,
        sessionDuration: 45
      },
      fees: {
        registrationFee: 500,
        monthlyFee: parseInt(price),
        examFee: 200
      },
      curriculum: [{
        week: 1,
        topic: 'Basic Introduction',
        objectives: ['Learn basic techniques'],
        techniques: []
      }],
      ageGroup: {
        min: 5,
        max: 12
      },
      currentEnrollment: 0,
      schedule: schedule || 'Mon, Wed, Fri - 6:00 PM',
      isActive: true
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: { course }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.map(e => `${e.field}: ${e.message}`)
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error creating course',
      details: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Staff)
const updateCourse = async (req, res) => {
  try {
    const {
      title,
      ageGroup,
      duration,
      schedule,
      price,
      category,
      description,
      features,
      status
    } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Update fields if provided
    if (title) course.name = title;
    if (category) course.level = category;
    if (description) course.description = description;
    if (price) course.fees.monthlyFee = parseInt(price);
    if (schedule) course.schedule = schedule;
    if (status !== undefined) course.isActive = status === 'active';

    // Parse and update age group if provided
    if (ageGroup) {
      let ageGroupParsed = { min: 5, max: 100 }; // Default values
      
      // Try different patterns for age group
      const ageMatch = ageGroup.match(/(\d+)[-\s]*(\d+)?/);
      if (ageMatch) {
        const minAge = parseInt(ageMatch[1]);
        const maxAge = ageMatch[2] ? parseInt(ageMatch[2]) : (minAge + 10); // Default range if only one number
        ageGroupParsed = { min: minAge, max: maxAge };
      } else if (ageGroup.toLowerCase().includes('adult') || ageGroup.includes('18+')) {
        ageGroupParsed = { min: 18, max: 100 };
      } else if (ageGroup.toLowerCase().includes('teen')) {
        ageGroupParsed = { min: 13, max: 17 };
      } else if (ageGroup.toLowerCase().includes('junior') || ageGroup.toLowerCase().includes('kid')) {
        ageGroupParsed = { min: 8, max: 12 };
      } else if (ageGroup.toLowerCase().includes('little')) {
        ageGroupParsed = { min: 4, max: 7 };
      }
      
      course.ageGroup = ageGroupParsed;
    }

    // Parse and update duration if provided
    if (duration) {
      const durationMatch = duration.match(/(\d+)/);
      if (durationMatch) {
        course.duration.sessionDuration = parseInt(durationMatch[1]);
      }
    }

    // Update curriculum from features if provided
    if (features && Array.isArray(features)) {
      course.curriculum = features.filter(f => f.trim()).map((feature, index) => ({
        week: index + 1,
        topic: feature.trim(),
        objectives: [feature.trim()],
        techniques: []
      }));
    }

    await course.save();

    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating course'
    });
  }
};

// @desc    Delete course (hard delete)
// @route   DELETE /api/courses/:id
// @access  Private (Admin/Staff)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if course has enrolled students
    if (course.currentEnrollment > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete course with enrolled students. Please transfer students first.'
      });
    }

    // Hard delete - permanently remove from database
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Course permanently deleted from database'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting course'
    });
  }
};

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private (Admin/Staff)
const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Find students enrolled in this course
    const students = await Student.find({ 
      courseLevel: course.level,
      status: 'active'
    }).select('fullName email phone currentBelt enrollmentDate');

    res.status(200).json({
      status: 'success',
      data: {
        course: {
          id: course._id,
          name: course.name,
          level: course.level
        },
        students: students.map(student => ({
          id: student._id,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          currentBelt: student.currentBelt,
          enrollmentDate: student.enrollmentDate
        }))
      }
    });

  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching course students'
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents
};