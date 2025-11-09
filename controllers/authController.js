const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { promisify } = require('util');
const ms = require('ms');
const sendEmail = require('../utils/email.js');
const crypto = require('crypto');

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
    sameSite: 'None',
    maxAge: refreshTokenExpiry,
  });

  newUser.password = undefined;
  newUser.refreshToken = undefined;
  newUser.refreshTokenExpiresAt = undefined;

  res.status(201).json({ status: 'success', accessToken, data: newUser });
});

exports.signupMobile = catchAsync(async (req, res, next) => {
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

  newUser.password = undefined;
  newUser.refreshToken = undefined;
  newUser.refreshTokenExpiresAt = undefined;

  res.status(201).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: newUser,
  });
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
    sameSite: 'None',
    maxAge: refreshTokenExpiry,
  });

  user.password = undefined;
  user.refreshToken = undefined;
  user.refreshTokenExpiresAt = undefined;

  res.status(200).json({ status: 'success', accessToken, data: user });
});

exports.loginMobile = catchAsync(async (req, res, next) => {
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

  user.password = undefined;
  user.refreshToken = undefined;
  user.refreshTokenExpiresAt = undefined;

  res.status(200).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: user,
  });
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
      new AppError('You are not logged in! Please log in to gain access!', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_ACCESS_SECRET
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The token belonging to this user does no longer exist!',
        401
      )
    );
  }

  if (await currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action'),
        403
      );
    }
    next();
  };
};

exports.verify = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .json({ status: 'success', message: 'The user verified successfully!' });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address!', 404));
  }

  const resetToken = await user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (valid for 10 min)`,
      message,
    });
    res
      .status(200)
      .json({ status: ' success', data: 'Reset token sent to the email!' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired!', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  res
    .status(200)
    .json({ status: 'success', message: 'The password changed successfully!' });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  let refreshToken =
    req.cookies.refreshToken ||
    (req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!refreshToken) return next(new AppError('Refresh token required', 400));

  const hashedToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const user = await User.findOne({
    refreshToken: hashedToken,
    refreshTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or expired', 401));

  const accessToken = signToken(
    user._id,
    process.env.JWT_ACCESS_SECRET,
    process.env.ACCESS_EXPIRES_IN
  );

  const isMobile = !!req.headers.authorization;
  if (isMobile) {
    const newRefreshToken = signToken(
      user._id,
      process.env.JWT_REFRESH_SECRET,
      process.env.REFRESH_EXPIRES_IN
    );

    const refreshTokenExpiry = ms(process.env.REFRESH_EXPIRES_IN);

    await user.setRefreshToken(newRefreshToken, refreshTokenExpiry);

    user.password = undefined;
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;

    return res.status(200).json({
      status: 'success',
      accessToken,
      refreshToken: newRefreshToken,
      message: 'Tokens refreshed successfully',
    });
  }

  res.status(200).json({
    status: 'success',
    accessToken,
    message: 'Access token sent successfully',
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const user = req.user;
  user.refreshToken = undefined;
  user.refreshTokenExpiresAt = undefined;
  await user.save({ validateBeforeSave: false });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });

  res.status(200).json({ status: 'success', data: null });
});
