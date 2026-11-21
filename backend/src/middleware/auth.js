const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../utils/jwt');

async function authenticate(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Authentication is required.' });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.sub);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'This account is not available.' });
    }

    req.user = user;
    if (user.mustChangePassword && !['/me', '/change-password'].includes(req.path)) {
      return res.status(403).json({
        success: false,
        message: 'Change your password before continuing.'
      });
    }
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'The access token is invalid or expired.' });
    }
    return next(error);
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to do this.' });
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
