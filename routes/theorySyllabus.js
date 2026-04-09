const express = require('express');
const router = express.Router();
const {
  getTenets, createTenet, updateTenet, deleteTenet,
  getDynasties, createDynasty, updateDynasty, deleteDynasty,
  getPowerItems, createPowerItem, updatePowerItem, deletePowerItem,
  getHistorySections, createHistorySection, updateHistorySection, deleteHistorySection,
  getBasicTheoryContent, createBasicTheoryContent, updateBasicTheoryContent, deleteBasicTheoryContent,
} = require('../controllers/theorySyllabusController');
const { protect, authorize } = require('../middleware/auth');
const { uploadTheory } = require('../config/upload');

// ─── TENETS ───────────────────────────────────────────────────────────────────
router.get('/tenets', getTenets);
router.post('/tenets', protect, authorize('admin'), createTenet);
router.put('/tenets/:id', protect, authorize('admin'), updateTenet);
router.delete('/tenets/:id', protect, authorize('admin'), deleteTenet);

// ─── DYNASTIES ────────────────────────────────────────────────────────────────
router.get('/dynasties', getDynasties);
router.post('/dynasties', protect, authorize('admin'), createDynasty);
router.put('/dynasties/:id', protect, authorize('admin'), updateDynasty);
router.delete('/dynasties/:id', protect, authorize('admin'), deleteDynasty);

// ─── THEORY OF POWER ──────────────────────────────────────────────────────────
router.get('/power', getPowerItems);
router.post('/power', protect, authorize('admin'), createPowerItem);
router.put('/power/:id', protect, authorize('admin'), updatePowerItem);
router.delete('/power/:id', protect, authorize('admin'), deletePowerItem);

// ─── HISTORY SECTIONS ─────────────────────────────────────────────────────────
router.get('/history', getHistorySections);
router.post('/history', protect, authorize('admin'), createHistorySection);
router.put('/history/:id', protect, authorize('admin'), updateHistorySection);
router.delete('/history/:id', protect, authorize('admin'), deleteHistorySection);

// ─── BASIC THEORY CONTENT ─────────────────────────────────────────────────────
router.get('/basic-theory', getBasicTheoryContent);
router.post('/basic-theory', protect, authorize('admin'), uploadTheory.any(), createBasicTheoryContent);
router.put('/basic-theory/:id', protect, authorize('admin'), uploadTheory.any(), updateBasicTheoryContent);
router.delete('/basic-theory/:id', protect, authorize('admin'), deleteBasicTheoryContent);

module.exports = router;
