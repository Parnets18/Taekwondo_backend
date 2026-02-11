const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, staffOnly, adminOnly } = require('../middleware/auth');

// Test route (no auth required)
router.get('/test', (req, res) => {
  console.log('📅 Events test route called');
  res.json({ 
    status: 'success', 
    message: 'Events routes working',
    timestamp: new Date().toISOString()
  });
});

// Public routes (no auth required) - MUST BE BEFORE protect middleware
router.get('/public', eventController.getEventsPublic);
router.get('/public/:id', eventController.getEventById);

// Statistics route (require authentication) - MUST BE BEFORE /:id route
router.get('/statistics', protect, eventController.getEventStatistics);
router.get('/stats/overview', protect, eventController.getEventStatistics); // Keep for backward compatibility

// Protected routes (require authentication)
router.get('/', protect, eventController.getEvents);
router.get('/:id', protect, eventController.getEventById);

// Student routes (require authentication)
router.post('/:id/register', protect, eventController.registerForEvent);
router.post('/:id/unregister', protect, eventController.unregisterFromEvent);

// Staff only routes (admin and instructors)
router.post('/', protect, staffOnly, eventController.createEvent);
router.put('/:id', protect, staffOnly, eventController.updateEvent);

// Admin only routes
router.delete('/:id', protect, adminOnly, eventController.deleteEvent);

module.exports = router;