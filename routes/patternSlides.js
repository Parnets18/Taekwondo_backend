const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/patternSlideController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'pattern-slides');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })
  .fields([{ name: 'images', maxCount: 10 }]);

router.get('/',           ctrl.getAll);
router.post('/',          protect, authorize('admin'), upload, ctrl.create);
router.patch('/:id/order',protect, authorize('admin'), ctrl.updateOrder);
router.put('/:id',        protect, authorize('admin'), upload, ctrl.update);
router.delete('/:id',     protect, authorize('admin'), ctrl.remove);

module.exports = router;
