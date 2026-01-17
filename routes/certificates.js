const express = require('express');
const router = express.Router();
const {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  verifyCertificate,
  downloadCertificate,
  getCertificateStatistics,
  sendCertificateEmail,
  upload
} = require('../controllers/certificateController');
const { protect, adminOnly, staffOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateCertificateCreation = [
  body('studentName')
    .notEmpty()
    .withMessage('Student name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  
  body('instructorName')
    .notEmpty()
    .withMessage('Instructor name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Instructor name must be between 2 and 100 characters'),
  
  body('achievementType')
    .isIn(['belt_promotion', 'course_completion', 'special_achievement', 'tournament_award', 'participation'])
    .withMessage('Invalid achievement type'),
  
  body('achievementTitle')
    .notEmpty()
    .withMessage('Achievement title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Achievement title must be between 2 and 200 characters'),
  
  body('achievementDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Achievement description cannot exceed 500 characters'),
  
  body('customVerificationCode')
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 32 })
    .withMessage('Verification code must be between 6 and 32 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Verification code must contain only uppercase letters and numbers')
];

const validateCertificateUpdate = [
  body('studentName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  
  body('achievementType')
    .optional()
    .isIn(['belt_promotion', 'course_completion', 'special_achievement', 'tournament_award', 'participation'])
    .withMessage('Invalid achievement type'),
  
  body('achievementTitle')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Achievement title must be between 2 and 200 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'revoked', 'expired'])
    .withMessage('Invalid status')
];

const validateVerification = [
  body('verificationCode')
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 32 })
    .withMessage('Invalid verification code format')
];

// Public routes
// POST /api/certificates/verify - Verify certificate (public)
router.post('/verify', validateVerification, verifyCertificate);

// Protected routes - require authentication (for admin functions)
// GET /api/certificates/statistics - Get certificate statistics (must come before /:id route)
router.get('/statistics', protect, staffOnly, getCertificateStatistics);

// GET /api/certificates - Get all certificates with filtering and pagination
router.get('/', protect, staffOnly, getCertificates);

// Public routes for individual certificates (after specific routes)
// GET /api/certificates/:id/download - Download certificate (public for verified certificates)
router.get('/:id/download', downloadCertificate);

// GET /api/certificates/:id - Get certificate by ID (public for verified certificates)
router.get('/:id', getCertificateById);

// POST /api/certificates/send-email - Send certificate via email (Staff only)
router.post('/send-email', protect, staffOnly, sendCertificateEmail);

// POST /api/certificates - Create new certificate with image upload (Staff only)
router.post('/', protect, staffOnly, upload.single('certificateImage'), validateCertificateCreation, createCertificate);

// PUT /api/certificates/:id - Update certificate (Staff only)
router.put('/:id', protect, staffOnly, upload.single('certificateImage'), validateCertificateUpdate, updateCertificate);

// DELETE /api/certificates/:id - Delete certificate (Admin only)
router.delete('/:id', protect, adminOnly, deleteCertificate);

module.exports = router;