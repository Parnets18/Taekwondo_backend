const Belt = require('../models/Belt');
const Promotion = require('../models/Promotion');
const BeltTest = require('../models/BeltTest');

// Get all belt levels
const getBeltLevels = async (req, res) => {
  try {
    const { isActive = true } = req.query;
    
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const belts = await Belt.find(filter)
      .sort({ level: 1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const stats = await Belt.getStatistics();

    res.json({
      status: 'success',
      data: {
        belts,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Error fetching belt levels:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt levels',
      error: error.message
    });
  }
};

// Get belt level by ID
const getBeltById = async (req, res) => {
  try {
    const belt = await Belt.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!belt) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt level not found'
      });
    }

    res.json({
      status: 'success',
      data: { belt }
    });
  } catch (error) {
    console.error('Error fetching belt:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt level',
      error: error.message
    });
  }
};

// Create new belt level
const createBelt = async (req, res) => {
  try {
    const { name, level, color, hex, requirements } = req.body;

    // Check if belt level already exists
    const existingBelt = await Belt.findOne({ level });
    if (existingBelt) {
      return res.status(400).json({
        status: 'error',
        message: 'Belt level already exists'
      });
    }

    const belt = new Belt({
      name,
      level,
      color,
      hex,
      requirements: requirements || [],
      createdBy: req.user?.id
    });

    await belt.save();

    const populatedBelt = await Belt.findById(belt._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Belt level created successfully',
      data: { belt: populatedBelt }
    });
  } catch (error) {
    console.error('Error creating belt:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create belt level',
      error: error.message
    });
  }
};

// Update belt level
const updateBelt = async (req, res) => {
  try {
    const { name, level, color, hex, requirements, students, isActive } = req.body;

    const belt = await Belt.findById(req.params.id);
    if (!belt) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt level not found'
      });
    }

    // Update fields
    if (name !== undefined) belt.name = name;
    if (level !== undefined) belt.level = level;
    if (color !== undefined) belt.color = color;
    if (hex !== undefined) belt.hex = hex;
    if (requirements !== undefined) belt.requirements = requirements;
    if (students !== undefined) belt.students = students;
    if (isActive !== undefined) belt.isActive = isActive;
    belt.updatedBy = req.user?.id;

    await belt.save();

    const updatedBelt = await Belt.findById(belt._id)
      .populate('updatedBy', 'name email');

    res.json({
      status: 'success',
      message: 'Belt level updated successfully',
      data: { belt: updatedBelt }
    });
  } catch (error) {
    console.error('Error updating belt:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update belt level',
      error: error.message
    });
  }
};

// Delete belt level
const deleteBelt = async (req, res) => {
  try {
    const belt = await Belt.findById(req.params.id);
    if (!belt) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt level not found'
      });
    }

    // Soft delete - mark as inactive
    belt.isActive = false;
    belt.updatedBy = req.user?.id;
    await belt.save();

    res.json({
      status: 'success',
      message: 'Belt level deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting belt:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete belt level',
      error: error.message
    });
  }
};

// Get all promotions
const getPromotions = async (req, res) => {
  try {
    const { page = 1, limit = 10, studentName, fromDate, toDate } = req.query;

    const filter = {};
    if (studentName) {
      filter.studentName = { $regex: studentName, $options: 'i' };
    }
    if (fromDate || toDate) {
      filter.promotionDate = {};
      if (fromDate) filter.promotionDate.$gte = new Date(fromDate);
      if (toDate) filter.promotionDate.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;

    const promotions = await Promotion.find(filter)
      .sort({ promotionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Promotion.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      data: {
        promotions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch promotions',
      error: error.message
    });
  }
};

// Create promotion
const createPromotion = async (req, res) => {
  try {
    const { studentName, studentId, fromBelt, toBelt, promotionDate, instructor, notes } = req.body;

    const promotion = new Promotion({
      studentName,
      studentId,
      fromBelt,
      toBelt,
      promotionDate,
      instructor,
      notes,
      createdBy: req.user?.id
    });

    await promotion.save();

    const populatedPromotion = await Promotion.findById(promotion._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Promotion recorded successfully',
      data: { promotion: populatedPromotion }
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to record promotion',
      error: error.message
    });
  }
};

// Get all belt tests
const getBeltTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, studentName, upcoming } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (studentName) {
      filter.studentName = { $regex: studentName, $options: 'i' };
    }
    if (upcoming === 'true') {
      filter.testDate = { $gte: new Date() };
      filter.status = 'scheduled';
    }

    const skip = (page - 1) * limit;

    const tests = await BeltTest.find(filter)
      .sort({ testDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await BeltTest.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      data: {
        tests,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching belt tests:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch belt tests',
      error: error.message
    });
  }
};

// Create belt test
const createBeltTest = async (req, res) => {
  try {
    const { studentName, studentId, currentBelt, testingFor, testDate, readiness, notes } = req.body;

    const test = new BeltTest({
      studentName,
      studentId,
      currentBelt,
      testingFor,
      testDate,
      readiness,
      notes,
      createdBy: req.user?.id
    });

    await test.save();

    const populatedTest = await BeltTest.findById(test._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      status: 'success',
      message: 'Belt test scheduled successfully',
      data: { test: populatedTest }
    });
  } catch (error) {
    console.error('Error creating belt test:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to schedule belt test',
      error: error.message
    });
  }
};

// Update belt test
const updateBeltTest = async (req, res) => {
  try {
    const { testDate, readiness, status, testResult, notes } = req.body;

    const test = await BeltTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Belt test not found'
      });
    }

    // Update fields
    if (testDate !== undefined) test.testDate = testDate;
    if (readiness !== undefined) test.readiness = readiness;
    if (status !== undefined) test.status = status;
    if (testResult !== undefined) test.testResult = testResult;
    if (notes !== undefined) test.notes = notes;

    await test.save();

    res.json({
      status: 'success',
      message: 'Belt test updated successfully',
      data: { test }
    });
  } catch (error) {
    console.error('Error updating belt test:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update belt test',
      error: error.message
    });
  }
};

// Get belt statistics
const getBeltStatistics = async (req, res) => {
  try {
    const beltStats = await Belt.getStatistics();
    
    const recentPromotions = await Promotion.countDocuments({
      promotionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const upcomingTests = await BeltTest.countDocuments({
      testDate: { $gte: new Date() },
      status: 'scheduled'
    });

    res.json({
      status: 'success',
      data: {
        ...beltStats,
        recentPromotions,
        upcomingTests
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

module.exports = {
  getBeltLevels,
  getBeltById,
  createBelt,
  updateBelt,
  deleteBelt,
  getPromotions,
  createPromotion,
  getBeltTests,
  createBeltTest,
  updateBeltTest,
  getBeltStatistics
};
