const Event = require('../models/eventModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.upcomingFive = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'date';
  req.query.fields = 'title,description,artist,date,coverImage';
  next();
};

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
  res.status(200).json({ status: 'success', data: { events } });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found!', 404));
  }
  res.status(200).json({ status: 'success', data: { event } });
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
    coverImage: req.body.coverImage,
  });
  res.status(201).json({ status: 'success', data: { newEvent } });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!updatedEvent) {
    return next(new AppError('Event not found!', 404));
  }

  res.status(200).json({ status: 'success', data: { updatedEvent } });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const deletedEvent = await Event.findByIdAndDelete(req.params.id);
  if (!deletedEvent) {
    return next(new AppError('Event not found!', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});
