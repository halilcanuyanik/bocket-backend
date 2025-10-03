const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    requied: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    minLength: [8, 'The password must include at least 8 characters!'],
    required: [true, 'Please provide your password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  refreshToken: {
    type: String,
    select: false,
  },
  refreshTokenExpiresAt: {
    type: Date,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptjs.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPassword
) {
  return await bcryptjs.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.passwordChangedAfter = async function (JWTTimestamp) {
  let changedTimestamp;
  if (this.passwordChangedAt) {
    changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.setRefreshToken = async function (token, expiresInMs) {
  this.refreshToken = crypto.createHash('sha256').update(token).digest('hex');
  if (expiresInMs) {
    this.refreshTokenExpiresAt = Date.now() + expiresInMs;
  }
  await this.save({ validateBeforeSave: false });
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
