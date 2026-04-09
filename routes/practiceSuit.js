const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/practiceSuitController');
const { protect, authorize } = require('../middleware/auth');
const { uploadBodyPart } = require('../config/upload');

const upload = uploadBodyPart.fields([{ name: 'images', maxCount: 10 }]);

router.get('/',       getAll);
router.post('/',      protect, authorize('admin'), upload, create);
router.put('/:id',    protect, authorize('admin'), upload, update);
router.delete('/:id', protect, authorize('admin'), remove);

module.exports = router;
