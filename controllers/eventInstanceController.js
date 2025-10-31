const Event = require('../models/eventModel');
const EventInstance = require('../models/eventInstanceModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllEventInstances = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query, EventInstance.find())
    .filter()
    .sort()
    .limitFields();
  // .paginate();

  const allEventInstances = await features.monQuery;

  if (!allEventInstances) {
    return next(new AppError('There is no any event instance!', 404));
  }

  res.status(200).json({ status: 'success', data: { allEventInstances } });
});

exports.getEventInstances = catchAsync(async (req, res, next) => {
  const eventId = req.params.id;

  const event = await Event.findById(eventId);

  if (!event) {
    return next(new AppError('No event found!', 404));
  }

  const instances = await EventInstance.find({ eventId });
  if (!instances.length) {
    return next(new AppError('No instance found for this event!', 404));
  }

  res.status(200).json({ status: 'success', data: { instances } });
});

exports.getEventInstance = catchAsync(async (req, res, next) => {
  const instance = await EventInstance.findById(req.params.id);

  if (!instance) {
    return next(new AppError('No instance found!', 404));
  }

  res.status(200).json({ status: 'success', data: { instance } });
});

exports.createEventInstance = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.body.eventId);

  if (!event) {
    return next(new AppError('Event not found!', 404));
  }

  const newEventInstance = await EventInstance.create({
    eventId: req.body.eventId,
    venueId: req.body.venueId,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    pricing: {
      base: req.body.pricing?.base,
      currency: req.body.pricing?.currency,
    },
  });

  res.status(201).json({ status: 'success', data: { newEventInstance } });
});

exports.updateEventInstance = catchAsync(async (req, res, next) => {
  const updatedInstance = await EventInstance.findByIdAndUpdate(
    req.params.id,
    {
      eventId: req.body.eventId,
      venueId: req.body.venueId,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      pricing: {
        base: req.body.pricing?.base,
        currency: req.body.pricing?.currency,
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedInstance)
    return next(new AppError('Event instance not found!', 404));

  res.status(200).json({ status: 'success', data: { updatedInstance } });
});

exports.deleteEventInstance = catchAsync(async (req, res, next) => {
  const deletedEventInstance = await EventInstance.findByIdAndDelete(
    req.params.id
  );

  if (!deletedEventInstance) {
    return next(new AppError('Event instance not found!', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
