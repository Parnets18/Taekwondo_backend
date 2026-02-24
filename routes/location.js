const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Public routes
router.get('/active', locationController.getActiveLocations);
router.get('/type/:type', locationController.getLocationsByType);

// Admin routes
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.post('/', locationController.createLocation);
router.put('/:id', locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);
router.patch('/:id/toggle', locationController.toggleActiveStatus);

module.exports = router;
