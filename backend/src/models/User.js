const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roles = ['admin', 'teacher', 'parent', 'student'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 254,
    sparse: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 30,
    sparse: true,
    unique: true
  },
  loginId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 80,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: roles,
    required: true
  },
  mustChangePassword: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.roles = roles;

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
