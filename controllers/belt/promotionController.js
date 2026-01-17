const Promotion = require('../../models/Promotion');

// Get all promotions
const getPromotions = async (req, res) => {
  try {
    console.log('📋 Fetching promotions...');
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

    console.log(`✅ Found ${promotions.length} promotions`);

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
    console.error('❌ Error fetching promotions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch promotions',
      error: error.message
    });
  }
};

// Get promotion by ID
const getPromotionById = async (req, res) => {
  try {
    console.log(`📋 Fetching promotion: ${req.params.id}`);
    const promotion = await Promotion.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!promotion) {
      return res.status(404).json({
        status: 'error',
        message: 'Promotion not found'
      });
    }

    console.log(`✅ Found promotion for: ${promotion.studentName}`);

    res.json({
      status: 'success',
      data: { promotion }
    });
  } catch (error) {
    console.error('❌ Error fetching promotion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch promotion',
      error: error.message
    });
  }
};

// Create promotion
const createPromotion = async (req, res) => {
  try {
    console.log('➕ Creating new promotion...');
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

    console.log(`✅ Created promotion for: ${promotion.studentName}`);

    res.status(201).json({
      status: 'success',
      message: 'Promotion recorded successfully',
      data: { promotion: populatedPromotion }
    });
  } catch (error) {
    console.error('❌ Error creating promotion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to record promotion',
      error: error.message
    });
  }
};

// Update promotion
const updatePromotion = async (req, res) => {
  try {
    console.log(`✏️ Updating promotion: ${req.params.id}`);
    const { fromBelt, toBelt, promotionDate, instructor, notes, certificateIssued } = req.body;

    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        status: 'error',
        message: 'Promotion not found'
      });
    }

    // Update fields
    if (fromBelt !== undefined) promotion.fromBelt = fromBelt;
    if (toBelt !== undefined) promotion.toBelt = toBelt;
    if (promotionDate !== undefined) promotion.promotionDate = promotionDate;
    if (instructor !== undefined) promotion.instructor = instructor;
    if (notes !== undefined) promotion.notes = notes;
    if (certificateIssued !== undefined) promotion.certificateIssued = certificateIssued;

    await promotion.save();

    console.log(`✅ Updated promotion for: ${promotion.studentName}`);

    res.json({
      status: 'success',
      message: 'Promotion updated successfully',
      data: { promotion }
    });
  } catch (error) {
    console.error('❌ Error updating promotion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update promotion',
      error: error.message
    });
  }
};

// Delete promotion
const deletePromotion = async (req, res) => {
  try {
    console.log(`🗑️ Deleting promotion: ${req.params.id}`);
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({
        status: 'error',
        message: 'Promotion not found'
      });
    }

    console.log(`✅ Deleted promotion for: ${promotion.studentName}`);

    res.json({
      status: 'success',
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting promotion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete promotion',
      error: error.message
    });
  }
};

// Get promotion statistics
const getPromotionStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching promotion statistics...');
    
    const recentPromotions = await Promotion.countDocuments({
      promotionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const totalPromotions = await Promotion.countDocuments();

    console.log('✅ Promotion statistics fetched successfully');

    res.json({
      status: 'success',
      data: {
        recentPromotions,
        totalPromotions
      }
    });
  } catch (error) {
    console.error('❌ Error fetching promotion statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch promotion statistics',
      error: error.message
    });
  }
};

module.exports = {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionStatistics
};
