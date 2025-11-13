const Show = require('../models/showModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getShows = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query, Show.find())
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const shows = await features.monQuery;

  if (!shows) {
    return next(new AppError('No show found!', 404));
  }
  res.status(200).json({ status: 'success', data: shows });
});

exports.getShow = catchAsync(async (req, res, next) => {
  const show = await Show.findById(req.params.id);

  if (!show) {
    return next(new AppError('No show found!', 404));
  }

  res.status(200).json({ status: 'success', data: show });
});

exports.createShow = catchAsync(async (req, res, next) => {
  const newShow = await Show.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    coverImage: req.body.coverImage,
    organizerId: req.body.organizerId,
    approvedBy: req.body.approvedBy,
    status: req.body.status,
    performers: req.body.performers,
  });

  res.status(201).json({ status: 'success', data: newShow });
});

exports.updateShow = catchAsync(async (req, res, next) => {
  const updatedShow = await Show.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      coverImage: req.body.coverImage,
      organizerId: req.body.organizerId,
      approvedBy: req.body.approvedBy,
      status: req.body.status,
      performers: req.body.performers,
    },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedShow) {
    return next(new AppError('Show not found!', 404));
  }

  res.status(200).json({ status: 'success', data: updatedShow });
});

exports.deleteShow = catchAsync(async (req, res, next) => {
  const showId = req.params.id;

  const show = await Show.findById(showId);

  if (!show) {
    return next(new AppError('Show not found!', 404));
  }

  await ShowInstance.deleteMany({ showId });
  await show.deleteOne();

  res.status(204).json({ status: 'success', data: null });
});
