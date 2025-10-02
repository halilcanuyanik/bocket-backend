const mongoose = require('mongoose');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const ms = require('ms');

function signToken(id, secret, expiresIn) {
  return jwt.sign({ id }, secret, { expiresIn });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const refreshToken = signToken(
    newUser._id,
    process.env.JWT_REFRESH_SECRET,
    process.env.REFRESH_EXPIRES_IN
  );

  const accessToken = signToken(
    newUser._id,
    process.env.JWT_ACCESS_SECRET,
    process.env.ACCESS_EXPIRES_IN
  );

  const refreshTokenExpiry = ms(process.env.REFRESH_EXPIRES_IN);

  await newUser.setRefreshToken(refreshToken, refreshTokenExpiry);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: refreshTokenExpiry,
  });

  newUser.password = undefined;
  newUser.refreshToken = undefined;
  newUser.refreshTokenExpiresAt = undefined;

  res.status(201).json({ status: 'success', accessToken, data: { newUser } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 404));
  }

  const refreshToken = signToken(
    user._id,
    process.env.JWT_REFRESH_SECRET,
    process.env.REFRESH_EXPIRES_IN
  );

  const accessToken = signToken(
    user._id,
    process.env.JWT_ACCESS_SECRET,
    process.env.ACCESS_EXPIRES_IN
  );

  const refreshTokenExpiry = ms(process.env.REFRESH_EXPIRES_IN);

  await user.setRefreshToken(refreshToken, refreshTokenExpiry);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: refreshTokenExpiry,
  });

  user.password = undefined;
  user.refreshToken = undefined;
  user.refreshTokenExpiresAt = undefined;

  res.status(200).json({ status: 'success', accessToken, data: { user } });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to gain access!')
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The token belonging to this user does no longer exist!',
        401
      )
    );
  }

  if (await currentUser.hasPasswordChangedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const token = req.cookies.refreshToken;
});
