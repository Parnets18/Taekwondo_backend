const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/techniqueDivisionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',      getAll);
router.get('/:id',   getById);
router.post('/',     protect, authorize('admin'), create);
router.put('/:id',   protect, authorize('admin'), update);
router.delete('/:id',protect, authorize('admin'), remove);

module.exports = router;
