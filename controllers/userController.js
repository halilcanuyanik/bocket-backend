const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.search = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return next(new AppError('Query is required', 400));
  }

  const regex = new RegExp(query, 'i');

  const users = await User.aggregate([
    {
      $match: {
        // role: 'user',
        $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }],
      },
    },
    {
      $project: {
        _id: 1,
        email: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  if (!users) {
    return next(new AppError('No user found!', 404));
  }
  res
    .status(200)
    .json({ status: 'success', results: users.length, data: users });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found!', 404));
  }
  res.status(200).json({ status: 'success', data: user });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({ status: 'success', data: newUser });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, email: req.body.email },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError('User not found!', 404));
  }
  res.status(200).json({ status: 'success', data: updatedUser });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) {
    return next(new AppError('User not found!', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});
