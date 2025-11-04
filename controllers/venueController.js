const Venue = require('../models/venueModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getVenues = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(req.query, Venue.find())
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const venues = await features.monQuery;

  if (!venues) {
    return next(new AppError('No venue found!', 404));
  }

  res.status(200).json({ status: 'success', data: { venues } });
});

exports.getVenue = catchAsync(async (req, res, next) => {
  const venue = await Venue.findById(req.params.id);

  if (!venue) {
    return next(new AppError('No venue found!', 404));
  }

  res.status(200).json({ status: 'success', data: { venue } });
});

exports.createVenue = catchAsync(async (req, res, next) => {
  const newVenue = await Venue.create({
    name: req.body.name,
    address: req.body.address,
    city: req.body.city,
    country: req.body.country,
    hasSeatMap: req.body.hasSeatMap,
    seatMap: req.body.seatMap,
    capacity: req.body.capacity,
  });

  res.status(201).json({ status: 'success', data: { newVenue } });
});

exports.updateVenue = catchAsync(async (req, res, next) => {
  const updatedVenue = await Venue.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      hasSeatMap: req.body.hasSeatMap,
      seatMap: req.body.seatMap,
      capacity: req.body.capacity,
    },
    {
      runValidators: true,
      new: true,
    }
  );
});

exports.deleteVenue = catchAsync(async (req, res, next) => {
  const venue = await Venue.findByIdAndDelete(req.params.id);

  if (!venue) {
    return next(new AppError('Venue not found!', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
