const Performer = require('../models/performerModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.search = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return next(new AppError('Query is required', 400));
  }

  const regex = new RegExp(query, 'i');

  const performers = await Performer.aggregate([
    {
      $match: {
        name: { $regex: regex },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: performers.length,
    data: performers,
  });
});

exports.getPerformers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query, Performer.find())
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const performers = await features.monQuery;

  if (!performers) {
    return next(new AppError('No performer found!', 404));
  }
  res
    .status(200)
    .json({ status: 'success', results: performers.length, data: performers });
});

exports.getPerformer = catchAsync(async (req, res, next) => {
  const performer = await Performer.findById(req.params.id);

  if (!performer) {
    return next(new AppError('No performer found!', 404));
  }
  res.status(200).json({ status: 'success', data: performer });
});

exports.createPerformer = catchAsync(async (req, res, next) => {
  const newPerformer = await Performer.create({
    name: req.body.name,
    avatarImage: req.body.avatarImage,
    averageRating: req.body.averageRating,
    ratingCount: req.body.ratingCount,
  });
  res.status(201).json({ status: 'success', data: newPerformer });
});

exports.updatePerformer = catchAsync(async (req, res, next) => {
  const updatedPerformer = await Performer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      avatarImage: req.body.avatarImage,
      averageRating: req.body.averageRating,
      ratingCount: req.body.ratingCount,
    },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedPerformer) {
    return next(new AppError('Performer not found!', 404));
  }

  res.status(200).json({ status: 'success', data: updatedPerformer });
});

exports.deletePerformer = catchAsync(async (req, res, next) => {
  const deletedPerformer = await Performer.findByIdAndDelete(req.params.id);
  if (!deletedPerformer) {
    return next(new AppError('Performer not found!', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});
