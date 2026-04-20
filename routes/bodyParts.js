const express = require('express');
const router = express.Router();
const { getBodyParts, createBodyPart, updateBodyPart, deleteBodyPart, getBlockingToolStructure } = require('../controllers/bodyPartController');
const { protect, authorize } = require('../middleware/auth');
const { uploadBodyPart } = require('../config/upload');

const upload = uploadBodyPart.fields([
  { name: 'image',  maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

router.get('/',                    getBodyParts);
router.get('/:id/structure',       getBlockingToolStructure);
router.post('/',                   protect, authorize('admin'), upload, createBodyPart);
router.put('/:id',                 protect, authorize('admin'), upload, updateBodyPart);
router.delete('/:id',              protect, authorize('admin'), deleteBodyPart);

module.exports = router;
