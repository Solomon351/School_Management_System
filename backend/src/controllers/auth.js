const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createAccessToken } = require('../utils/jwt');

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email || null,
    phone: user.phone || null,
    loginId: user.loginId,
    role: user.role,
    mustChangePassword: user.mustChangePassword
  };
}

function normalizeIdentifier(identifier) {
  const value = identifier.trim();
  return {
    email: value.toLowerCase(),
    loginId: value.toUpperCase(),
    phone: value
  };
}

async function login(req, res, next) {
  try {
    const identifier = req.body && (req.body.identifier || req.body.email || req.body.loginId);
    const password = req.body && req.body.password;

    if (typeof identifier !== 'string' || !identifier.trim() || typeof password !== 'string' || !password) {
      throw createHttpError(400, 'ID or email and password are required.');
    }
    if (identifier.length > 254 || Buffer.byteLength(password, 'utf8') > 72) {
      throw createHttpError(400, 'Login details are not valid.');
    }

    const values = normalizeIdentifier(identifier);
    const user = await User.findOne({
      $or: [
        { email: values.email },
        { loginId: values.loginId },
        { phone: values.phone }
      ]
    }).select('+passwordHash');

    if (!user || user.status !== 'active' || !(await user.comparePassword(password))) {
      throw createHttpError(401, 'The ID, email, or password is incorrect.');
    }

    const token = createAccessToken(user);
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        token,
        user: publicUser(user)
      }
    });
  } catch (error) {
    next(error);
  }
}

function getMe(req, res) {
  res.json({
    success: true,
    data: { user: publicUser(req.user) }
  });
}

async function changePassword(req, res, next) {
  try {
    const currentPassword = req.body && req.body.currentPassword;
    const newPassword = req.body && req.body.newPassword;

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      throw createHttpError(400, 'Current password and new password are required.');
    }
    if (Buffer.byteLength(currentPassword, 'utf8') > 72) {
      throw createHttpError(400, 'Current password is not valid.');
    }
    if (Buffer.byteLength(newPassword, 'utf8') > 72) {
      throw createHttpError(400, 'New password must be no more than 72 bytes.');
    }
    if (newPassword.length < 8) {
      throw createHttpError(400, 'New password must be at least 8 characters long.');
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw createHttpError(401, 'Current password is incorrect.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.mustChangePassword = false;
    await user.save();

    res.json({
      success: true,
      data: { user: publicUser(user) }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { changePassword, getMe, login };
