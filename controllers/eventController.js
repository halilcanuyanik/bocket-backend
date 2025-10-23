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
    category: req.body.category,
    coverImage: req.body.coverImage,
    organizerId: req.body.organizerId,
    approvedBy: req.body.approvedBy,
    status: req.body.status,
    performers: req.body.performers,
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
