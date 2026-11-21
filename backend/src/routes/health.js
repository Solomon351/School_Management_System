const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/health', (req, res) => {
  const database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    data: { status: 'ok', database }
  });
});

module.exports = router;
