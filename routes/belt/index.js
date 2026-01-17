const express = require('express');
const router = express.Router();

console.log('🥋 Main Belt routes module loading...');

// Import sub-routes
const beltLevelsRoutes = require('./beltLevels');
const promotionsRoutes = require('./promotions');
const beltTestsRoutes = require('./beltTests');

// Import statistics controller
const { getCombinedStatistics } = require('../../controllers/belt/statisticsController');
const { protect } = require('../../middleware/auth');

// Combined statistics endpoint (must be before sub-routes to avoid conflicts)
router.get('/statistics', protect, getCombinedStatistics);

// Mount sub-routes
router.use('/levels', beltLevelsRoutes);
router.use('/promotions', promotionsRoutes);
router.use('/tests', beltTestsRoutes);

console.log('🥋 Main Belt routes configured with sub-routes');

module.exports = router;
