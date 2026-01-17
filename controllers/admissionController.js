const Admission = require('../models/Admission');

// @desc    Submit admission application
// @route   POST /api/admissions
// @access  Public
const submitAdmission = async (req, res) => {
  try {
    const admissionData = req.body;
    
    console.log('📝 Received admission data:', JSON.stringify(admissionData, null, 2));

    // Note: Allowing duplicate emails as multiple students can share the same email
    // (e.g., siblings using parent's email, family email, etc.)

    // Create admission application
    console.log('✅ Creating new admission...');
    const admission = await Admission.create(admissionData);
    console.log('✅ Admission created successfully:', admission._id);

    // Calculate age for the response
    const age = admission.age;

    res.status(201).json({
      status: 'success',
      message: 'Admission application submitted successfully. You will receive a confirmation email shortly.',
      data: {
        admission: {
          id: admission._id,
          fullName: admission.fullName,
          email: admission.email,
          courseLevel: admission.courseLevel,
          status: admission.status,
          submittedAt: admission.submittedAt,
          age: age
        }
      }
    });

  } catch (error) {
    console.error('❌ Admission submission error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error submitting admission application',
      error: error.message
    });
  }
};

// @desc    Get admission application status
// @route   GET /api/admissions/status/:email
// @access  Public
const getAdmissionStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const admission = await Admission.findOne({ email }).select(
      'fullName email courseLevel status submittedAt reviewedAt studentId'
    );

    if (!admission) {
      return res.status(404).json({
        status: 'error',
        message: 'No admission application found for this email'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        admission: {
          id: admission._id,
          fullName: admission.fullName,
          email: admission.email,
          courseLevel: admission.courseLevel,
          status: admission.status,
          submittedAt: admission.submittedAt,
          reviewedAt: admission.reviewedAt,
          studentId: admission.studentId,
          age: admission.age
        }
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking admission status'
    });
  }
};

// @desc    Get admission statistics (public)
// @route   GET /api/admissions/stats
// @access  Public
const getAdmissionStats = async (req, res) => {
  try {
    const stats = await Admission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await Admission.countDocuments();
    const thisMonthApplications = await Admission.countDocuments({
      submittedAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const levelStats = await Admission.aggregate([
      {
        $group: {
          _id: '$courseLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalApplications,
        thisMonthApplications,
        statusBreakdown: stats,
        levelBreakdown: levelStats
      }
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching admission statistics'
    });
  }
};

// @desc    Get all admissions (Admin only)
// @route   GET /api/admin/admissions
// @access  Private/Admin
const getAllAdmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.courseLevel) filter.courseLevel = req.query.courseLevel;
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const admissions = await Admission.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await Admission.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      status: 'success',
      data: {
        admissions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Get admissions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching admissions'
    });
  }
};

// @desc    Get single admission (Admin only)
// @route   GET /api/admin/admissions/:id
// @access  Private/Admin
const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({
        status: 'error',
        message: 'Admission application not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        admission
      }
    });

  } catch (error) {
    console.error('Get admission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching admission details'
    });
  }
};

// @desc    Update admission status (Admin only)
// @route   PUT /api/admin/admissions/:id/status
// @access  Private/Admin
const updateAdmissionStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const admissionId = req.params.id;

    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({
        status: 'error',
        message: 'Admission application not found'
      });
    }

    // Update admission
    admission.status = status;
    admission.adminNotes = adminNotes || admission.adminNotes;
    admission.reviewedAt = new Date();
    admission.reviewedBy = req.user ? req.user.id : null;

    // Generate student ID if approved and doesn't have one
    if (status === 'approved' && !admission.studentId) {
      admission.generateStudentId();
    }

    await admission.save();

    res.status(200).json({
      status: 'success',
      message: 'Admission status updated successfully',
      data: {
        admission
      }
    });

  } catch (error) {
    console.error('Update admission status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating admission status'
    });
  }
};

// @desc    Delete admission (Admin only)
// @route   DELETE /api/admin/admissions/:id
// @access  Private/Admin
const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({
        status: 'error',
        message: 'Admission application not found'
      });
    }

    await admission.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Admission application deleted successfully'
    });

  } catch (error) {
    console.error('Delete admission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting admission application'
    });
  }
};

module.exports = {
  submitAdmission,
  getAdmissionStatus,
  getAdmissionStats,
  getAllAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  deleteAdmission
};