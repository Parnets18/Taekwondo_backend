const express = require('express');
const router = express.Router();
const { getKorean, createKorean, updateKorean, deleteKorean } = require('../controllers/koreanController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',       getKorean);
router.post('/',      protect, authorize('admin'), createKorean);
router.put('/:id',    protect, authorize('admin'), updateKorean);
router.delete('/:id', protect, authorize('admin'), deleteKorean);

module.exports = router;
