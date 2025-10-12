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

exports.createEvent = catchAsync(async (req, res, next) => {
  const newEvent = await Event.create({
    title: req.body.title,
    description: req.body.description,
    artist: req.body.artist,
    category: req.body.category,
    location: {
      city: req.body['location.city'],
      venue: req.body['location.venue'],
    },
    date: req.body.date,
    price: req.body.price,
    ticketsAvailable: req.body.ticketsAvailable,
    coverImage: req.file.path,
  });
  res.status(201).json({ status: 'success', data: newEvent });
});
