const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/ping', authenticate, requireRole('admin'), (req, res) => {
  res.json({
    success: true,
    data: { message: 'Admin API is working.' }
  });
});

module.exports = router;
