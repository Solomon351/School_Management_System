const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured in backend/.env.');
  return secret;
}

function createAccessToken(user) {
  return jwt.sign(
    { role: user.role },
    getJwtSecret(),
    {
      subject: String(user._id),
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    }
  );
}

module.exports = { createAccessToken, getJwtSecret };
