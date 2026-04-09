const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/patternController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'patterns');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })
  .fields([{ name: 'image', maxCount: 1 }, { name: 'diagram', maxCount: 1 }, { name: 'descDiagram', maxCount: 1 }]);

router.get('/',                          ctrl.getAll);
router.get('/:id',                       ctrl.getById);
router.post('/',                         protect, authorize('admin'), upload, ctrl.create);
router.patch('/:id/order',               protect, authorize('admin'), ctrl.updateOrder);
router.put('/:id',                       protect, authorize('admin'), upload, ctrl.update);
router.delete('/:id',                    protect, authorize('admin'), ctrl.remove);

// Tab items
router.post('/:id/items',                protect, authorize('admin'), upload, ctrl.addItem);
router.put('/:id/items/:itemId',         protect, authorize('admin'), upload, ctrl.updateItem);
router.delete('/:id/items/:itemId',      protect, authorize('admin'), ctrl.removeItem);

module.exports = router;
