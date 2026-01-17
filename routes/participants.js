const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const participantController = require('../controllers/participantController');

console.log('👥 Participants routes loading...');

// All routes require authentication
router.use(protect);

// Participant routes
router.get('/:eventId/participants', participantController.getParticipants);
router.post('/:eventId/participants', participantController.registerParticipant);
router.put('/participants/:participantId', participantController.updateParticipationStatus);
router.delete('/:eventId/participants/:participantId', participantController.removeParticipant);

console.log('👥 Participants routes configured');

module.exports = router;
