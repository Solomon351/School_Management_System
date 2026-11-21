const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { changePassword, getMe, login } = require('../controllers/auth');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again later.' }
});

router.get('/login', (req, res) => {
  res.set('Allow', 'POST');
  res.status(405).json({
    success: false,
    message: 'Login requires POST with a JSON body containing identifier and password.'
  });
});
router.post('/login', loginLimiter, login);

router.get('/me', authenticate, requireRole(...User.roles), getMe);
router.post('/change-password', authenticate, requireRole(...User.roles), changePassword);

module.exports = router;
