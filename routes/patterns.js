const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const patternCtrl = require('../controllers/patternController');
const entryCtrl = require('../controllers/entryController');

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

// Pattern routes
router.get('/',                          patternCtrl.getAll);
router.get('/:id',                       patternCtrl.getById);
router.post('/',                         protect, authorize('admin'), upload, patternCtrl.create);
router.patch('/:id/order',               protect, authorize('admin'), patternCtrl.updateOrder);
router.put('/:id',                       protect, authorize('admin'), upload, patternCtrl.update);
router.delete('/:id',                    protect, authorize('admin'), patternCtrl.remove);

// Entry routes (separate collection for each pattern's entries)
router.get('/:patternId/entries',        entryCtrl.getByPattern);
router.get('/entries/:id',               entryCtrl.getById);
router.post('/:patternId/entries',       protect, authorize('admin'), upload, entryCtrl.create);
router.put('/entries/:id',               protect, authorize('admin'), upload, entryCtrl.update);
router.patch('/entries/:id/order',       protect, authorize('admin'), entryCtrl.updateOrder);
router.delete('/entries/:id',            protect, authorize('admin'), entryCtrl.remove);

module.exports = router;
