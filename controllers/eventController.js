const Event = require('../models/eventModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getEvents = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query, Event.find())
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const events = await features.monQuery;

  if (!events) {
    return next(new AppError('No event found!', 404));
  }
  res.status(200).json({ status: 'success', data: events });
});
