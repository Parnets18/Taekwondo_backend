const BeltExam = require('../models/BeltExam');

// @desc    Submit belt exam application
// @route   POST /api/belt-exams
// @access  Public
const submitBeltExam = async (req, res) => {
  try {
    const beltExamData = req.body;
    
    // Add photo path if file was uploaded
    if (req.file) {
      console.log('📁 File upload details:', {
        path: req.file.path,
        filename: req.file.filename,
        fieldname: req.file.fieldname
      });
      
      // Check if using Cloudinary or local storage
      if (req.file.path && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'))) {
        // Cloudinary upload - use the full URL
        beltExamData.photo = req.file.path;
        console.log('☁️ Belt exam photo uploaded to Cloudinary:', req.file.path);
      } else {
        // Local upload - store relative path
        beltExamData.photo = `uploads/belt-exams/${req.file.filename}`;
        console.log('📁 Belt exam photo uploaded locally:', beltExamData.photo);
      }
    }
    
    console.log('📝 Received belt exam data:', JSON.stringify(beltExamData, null, 2));

    // Validate age - must be at least 3 years old
    if (beltExamData.dateOfBirth) {
      const birthDate = new Date(beltExamData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 3) {
        return res.status(400).json({
          status: 'error',
          message: `Candidate must be at least 3 years old. Current age: ${age} years. Please check the date of birth.`
        });
      }
    }

    // Create belt exam application
    console.log('✅ Creating new belt exam application...');
    const beltExam = await BeltExam.create(beltExamData);
    console.log('✅ Belt exam application created successfully:', beltExam._id);

    res.status(201).json({
      status: 'success',
      message: 'Belt exam application submitted successfully. You will receive a confirmation email shortly.',
      data: {
        beltExam: {
          id: beltExam._id,
          candidateName: beltExam.candidateName,
          gmail: beltExam.gmail,
          examStatus: beltExam.examStatus,
          submittedAt: beltExam.submittedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Belt exam submission error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      console.error('Validation errors:', errors);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error submitting belt exam application',
      error: error.message
    });
  }
};

// @desc    Get all belt exams (Admin only)
// @route   GET /api/admin/belt-exams
// @access  Private/Admin
const getAllBeltExams = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.examStatus) filter.examStatus = req.query.examStatus;
    if (req.query.search) {
      filter.$or = [
        { candidateName: { $regex: req.query.search, $options: 'i' } },
        { gmail: { $regex: req.query.search, $options: 'i' } },
        { phoneNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const beltExams = await BeltExam.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await BeltExam.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      status: 'success',
      data: {
        beltExams,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get belt exams error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching belt exams'
    });
  }
};

// @desc    Get single belt exam (Admin only)
// @route   GET /api/admin/belt-exams/:id
// @access  Private/Admin
const getBeltExamById = async (req, res) => {
  try {
    const beltExam = await BeltExam.findById(req.params.id);

    if (!beltExam) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt exam application not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        beltExam
      }
    });

  } catch (error) {
    console.error('Get belt exam error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching belt exam details'
    });
  }
};

// @desc    Delete belt exam (Admin only)
// @route   DELETE /api/admin/belt-exams/:id
// @access  Private/Admin
const deleteBeltExam = async (req, res) => {
  try {
    const beltExam = await BeltExam.findById(req.params.id);

    if (!beltExam) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt exam application not found'
      });
    }

    await beltExam.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Belt exam application deleted successfully'
    });

  } catch (error) {
    console.error('Delete belt exam error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting belt exam application'
    });
  }
};

module.exports = {
  submitBeltExam,
  getAllBeltExams,
  getBeltExamById,
  deleteBeltExam
};
