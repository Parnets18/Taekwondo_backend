const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/beltSyllabusController');
const { protect, authorize } = require('../middleware/auth');
const { uploadTheory } = require('../config/upload');

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', protect, authorize('admin'), uploadTheory.any(), create);
router.put('/:id', protect, authorize('admin'), uploadTheory.any(), update);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;
