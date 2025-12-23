const Show = require('../models/showModel');
const Event = require('../models/eventModel');
const Venue = require('../models/venueModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.topRated = (req, res, next) => {
  req.pipeline = [
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
      $group: {
        _id: '$show._id',
        show: { $first: '$show' },
        events: { $push: '$$ROOT' },
      },
    },

    {
      $sort: {
        'show.averageRating': -1,
        'show.ratingCount': -1,
      },
    },

    {
      $addFields: {
        events: {
          $sortArray: {
            input: '$events',
            sortBy: { date: 1, _id: 1 },
          },
        },
      },
    },

    {
      $addFields: {
        event: { $arrayElemAt: ['$events', 0] },
      },
    },

    {
      $replaceRoot: { newRoot: '$event' },
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

    {
      $lookup: {
        from: 'performers',
        localField: 'show.performers',
        foreignField: '_id',
        as: 'show.performers',
      },
    },
  ];

  next();
};

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

exports.search = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return next(new AppError('Query is required', 400));
  }

  const regex = new RegExp(query, 'i');

  const events = await Event.aggregate([
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
        from: 'venues',
        localField: 'venueId',
        foreignField: '_id',
        as: 'venue',
      },
    },
    { $unwind: '$venue' },
    {
      $lookup: {
        from: 'performers',
        let: { performerIds: '$show.performers' },
        pipeline: [{ $match: { $expr: { $in: ['$_id', '$$performerIds'] } } }],
        as: 'show.performers',
      },
    },
    {
      $match: {
        $or: [
          { 'show.title': { $regex: regex } },
          { 'venue.name': { $regex: regex } },
          { 'show.performers.name': { $regex: regex } },
        ],
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: events.length,
    data: events,
  });
});

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

  res
    .status(200)
    .json({ status: 'success', results: allEvents.length, data: allEvents });
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

  res
    .status(200)
    .json({ status: 'success', results: events.length, data: events });
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

  const venue = await Venue.findById(req.body.venueId).lean();

  if (!venue) {
    return next(new AppError('Venue not found!', 404));
  }

  const eventSeatMap = JSON.parse(JSON.stringify(venue.seatMap));

  if (eventSeatMap.groups && req.body.pricing?.base != null) {
    eventSeatMap.groups.forEach((group) => {
      group.price = req.body.pricing.base;
    });
  }

  const newEvent = await Event.create({
    showId: req.body.showId,
    venueId: req.body.venueId,
    eventSeatMap,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    pricing: {
      base: req.body.pricing?.base,
      currency: req.body.pricing?.currency,
    },
  });

  res.status(201).json({ status: 'success', data: newEvent });
});

exports.updateEventTime = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) return next(new AppError('Event not found!', 404));

  const startTime = req.body.startTime;
  const endTime = req.body?.endTime;

  if (!startTime) {
    return next(new AppError('Invalid start time!', 400));
  }

  if (endTime && endTime <= startTime) {
    return next(new AppError('End time must be after start time.', 400));
  }

  event.startTime = startTime;
  if (endTime !== undefined) event.endTime = endTime;

  await event.save({ validateBeforeSave: false });

  res.status(200).json({ status: 'success', data: event });
});

exports.updateEventPrice = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) return next(new AppError('Event not found!', 404));

  const { base, currency } = req.body.pricing;

  if (event.eventSeatMap?.groups) {
    event.eventSeatMap.groups.forEach((group) => {
      if (group.price == null || group.price < req.body.pricing.base) {
        group.price = req.body.pricing.base;
      }
    });
  }

  event.pricing.base = base;
  event.pricing.currency = currency;

  await event.save({ validateBeforeSave: false });

  res.status(200).json({ status: 'success', data: event });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const deletedEvent = await Event.findByIdAndDelete(req.params.id);

  if (!deletedEvent) {
    return next(new AppError('No event found!', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
