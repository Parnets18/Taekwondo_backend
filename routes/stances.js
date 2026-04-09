const express = require('express');
const router = express.Router();
const { getStances, createStance, updateStance, deleteStance } = require('../controllers/stanceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadStance } = require('../config/upload');

const upload = uploadStance.fields([
  { name: 'diagramImage', maxCount: 1 },
  { name: 'personImages', maxCount: 10 },
]);

router.get('/',        getStances);
router.post('/',       protect, authorize('admin'), upload, createStance);
router.put('/:id',     protect, authorize('admin'), upload, updateStance);
router.delete('/:id',  protect, authorize('admin'), deleteStance);

module.exports = router;
