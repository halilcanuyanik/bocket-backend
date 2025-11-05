const Event = require('../models/eventModel');
const EventInstance = require('../models/eventInstanceModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.upcomingEvents = (req, res, next) => {
  req.pipeline = [
    { $match: { startTime: { $gte: new Date() } } },
    { $sort: { startTime: 1 } },
    {
      $group: {
        _id: '$eventId',
        eventInstance: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$eventInstance' } },

    {
      $lookup: {
        from: 'events',
        localField: 'eventId',
        foreignField: '_id',
        as: 'eventId',
      },
    },
    { $unwind: '$eventId' },

    {
      $lookup: {
        from: 'performers',
        localField: 'eventId.performers',
        foreignField: '_id',
        as: 'eventPerformers',
      },
    },
    {
      $set: {
        'eventId.performers': '$eventPerformers',
      },
    },
    { $unset: 'eventPerformers' },

    {
      $lookup: {
        from: 'venues',
        localField: 'venueId',
        foreignField: '_id',
        as: 'venueId',
      },
    },
    { $unwind: '$venueId' },

    {
      $addFields: {
        event: '$eventId',
        venue: '$venueId',
      },
    },
    { $unset: ['eventId', 'venueId'] },

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
        _id: '$eventId',
        eventInstance: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$eventInstance' } },
    { $sort: { fillRatio: -1 } },
    { $limit: 10 },

    {
      $lookup: {
        from: 'events',
        localField: 'eventId',
        foreignField: '_id',
        as: 'eventId',
      },
    },
    { $unwind: '$eventId' },

    {
      $lookup: {
        from: 'performers',
        localField: 'eventId.performers',
        foreignField: '_id',
        as: 'eventPerformers',
      },
    },
    {
      $set: {
        'eventId.performers': '$eventPerformers',
      },
    },
    { $unset: 'eventPerformers' },

    {
      $addFields: { event: '$eventId' },
    },
    { $unset: 'eventId' },
  ];

  next();
};

exports.getAllEventInstances = catchAsync(async (req, res, next) => {
  let allEventInstances;

  if (req.pipeline) {
    allEventInstances = await EventInstance.aggregate(req.pipeline);
  } else {
    const features = new APIFeatures(req.query, EventInstance.find())
      .filter()
      .sort()
      .limitFields()
      .paginate();
    allEventInstances = await features.monQuery;
  }

  if (!allEventInstances || allEventInstances.length === 0)
    return next(new AppError('No event instances found', 404));

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
