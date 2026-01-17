const Belt = require('../../models/Belt');
const Promotion = require('../../models/Promotion');
const BeltTest = require('../../models/BeltTest');

// Get combined belt management statistics
const getCombinedStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching combined belt statistics...');
    
    // Get belt statistics
    const beltStats = await Belt.getStatistics();
    
    // Get recent promotions count (last 30 days)
    const recentPromotions = await Promotion.countDocuments({
      promotionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Get upcoming tests count
    const upcomingTests = await BeltTest.countDocuments({
      testDate: { $gte: new Date() },
      status: 'scheduled'
    });

    const combinedStats = {
      ...beltStats,
      recentPromotions,
      upcomingTests
    };

    console.log('✅ Combined statistics fetched successfully');

    res.json({
      status: 'success',
      data: combinedStats
    });
  } catch (error) {
    console.error('❌ Error fetching combined statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch combined statistics',
      error: error.message
    });
  }
};

module.exports = {
  getCombinedStatistics
};
