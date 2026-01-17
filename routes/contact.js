const express = require('express');
const {
  submitContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactStats,
  getContactStatus
} = require('../controllers/contactController');
const { validateContact } = require('../middleware/validation');

const router = express.Router();

console.log('Contact routes loaded');

// Public routes
router.post('/', validateContact, submitContact);
router.get('/status/:email', getContactStatus);

// Admin routes
router.get('/admin/stats', getContactStats);
router.get('/admin', getAllContacts);
router.get('/admin/:id', getContactById);
router.put('/admin/:id', updateContact);
router.delete('/admin/:id', deleteContact);

console.log('Contact routes configured');

module.exports = router;