const express = require('express');
const router = express.Router();
const {
  getSparrings,
  getSparringByType,
  createSparring,
  updateSparring,
  deleteSparring,
} = require('../controllers/sparringController');
const { protect, authorize } = require('../middleware/auth');
const { uploadSparring } = require('../config/upload');

// Allow up to 20 section images (sectionImage_0 … sectionImage_19)
const sectionImageFields = Array.from({ length: 20 }, (_, i) => ({
  name: `sectionImage_${i}`, maxCount: 1,
}));
const upload = uploadSparring.fields(sectionImageFields);

router.get('/',      getSparrings);
router.get('/:type', getSparringByType);
router.post('/',     protect, authorize('admin'), upload, createSparring);
router.put('/:id',   protect, authorize('admin'), upload, updateSparring);
router.delete('/:id',protect, authorize('admin'), deleteSparring);

module.exports = router;
