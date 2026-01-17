const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const eventController = require('../controllers/eventController');

console.log('📅 Events routes loading...');

// All routes require authentication
router.use(protect);

// Statistics route
router.get('/statistics', eventController.getEventStatistics);

// Sync participant counts route
router.post('/sync-participants', eventController.syncParticipantCounts);

// Event routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

console.log('📅 Events routes configured');

module.exports = router;
