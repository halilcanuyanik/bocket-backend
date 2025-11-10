const Show = require('../models/eventModel');
const Event = require('../models/eventModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.upcoming = (req, res, next) => {
  req.pipeline = [
    {
      $match: {
        startTime: { $gte: new Date() },
      },
    },
    { $sort: { startTime: 1 } },
    {
      $group: {
        _id: '$showId',
        event: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$event' } },
    {
      $lookup: {
        from: 'shows',
        localField: 'showId',
        foreignField: '_id',
        as: 'show',
      },
    },
    { $unwind: '$show' },
    {
      $lookup: {
        from: 'performers',
        localField: 'show.performers',
        foreignField: '_id',
        as: 'show.performers',
      },
    },
    {
      $lookup: {
        from: 'venues',
        localField: 'venueId',
        foreignField: '_id',
        as: 'venue',
      },
    },
    { $unwind: '$venue' },
    { $sort: { startTime: 1 } },
    { $limit: 10 },
  ];
  next();
};

exports.almostSoldOut = (req, res, next) => {
  req.pipeline = [
    {
      $lookup: {
        from: 'venues',
        localField: 'venueId',
        foreignField: '_id',
        as: 'venue',
      },
    },
    { $unwind: '$venue' },
    {
      $addFields: {
        fillRatio: {
          $subtract: [1, { $divide: ['$availableTickets', '$venue.capacity'] }],
        },
      },
    },
    { $sort: { fillRatio: -1 } },
    {
      $group: {
        _id: '$showId',
        event: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$event' } },
    {
      $lookup: {
        from: 'shows',
        localField: 'showId',
        foreignField: '_id',
        as: 'show',
      },
    },
    { $unwind: '$show' },
    {
      $lookup: {
        from: 'performers',
        localField: 'show.performers',
        foreignField: '_id',
        as: 'show.performers',
      },
    },
    { $sort: { fillRatio: -1 } },
    { $limit: 10 },
  ];
  next();
};

exports.getAllEvents = catchAsync(async (req, res, next) => {
  let allEvents;

  if (req.pipeline) {
    allEvents = await Event.aggregate(req.pipeline);
  } else {
    const features = new APIFeatures(req.query, Event.find())
      .filter()
      .sort()
      .limitFields()
      .paginate();
    allEvents = await features.monQuery;
  }

  if (!allEvents || allEvents.length === 0)
    return next(new AppError('No event found', 404));

  res.status(200).json({ status: 'success', data: allEvents });
});

exports.getEvents = catchAsync(async (req, res, next) => {
  const showId = req.params.id;

  const show = await Show.findById(showId);

  if (!show) {
    return next(new AppError('No show found!', 404));
  }

  const events = await Event.find({ showId });

  if (!events.length) {
    return next(new AppError('No event found for this show!', 404));
  }

  res.status(200).json({ status: 'success', data: events });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found!', 404));
  }

  res.status(200).json({ status: 'success', data: event });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const show = await Show.findById(req.body.showId);

  if (!show) {
    return next(new AppError('Show not found!', 404));
  }

  const newEvent = await Event.create({
    showId: req.body.showId,
    venueId: req.body.venueId,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    pricing: {
      base: req.body.pricing?.base,
      currency: req.body.pricing?.currency,
    },
  });

  res.status(201).json({ status: 'success', data: newEvent });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    {
      showId: req.body.showId,
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

  if (!updatedEvent)
    return next(new AppError('Event instance not found!', 404));

  res.status(200).json({ status: 'success', data: updatedEvent });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const deletedEvent = await Event.findByIdAndDelete(req.params.id);

  if (!deletedEvent) {
    return next(new AppError('No event found!', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
