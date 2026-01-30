const express = require('express');
const router = express.Router();
const {
  login,
  register,
} = require('../controllers/loginController');

// ===============================
// LOGIN
// POST → /api/login
// ===============================
router.post('/', login);

// ===============================
// REGISTER (testing / admin use)
// POST → /api/login/register
// ===============================
router.post('/register', register);

module.exports = router;
