const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/theoryQuestionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',        ctrl.getAll);
router.get('/admin',   protect, authorize('admin'), ctrl.getAllAdmin);
router.post('/bulk',   protect, authorize('admin'), ctrl.bulkCreate);
router.post('/',       protect, authorize('admin'), ctrl.create);
router.put('/:id',     protect, authorize('admin'), ctrl.update);
router.delete('/:id',  protect, authorize('admin'), ctrl.remove);

module.exports = router;
