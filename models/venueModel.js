const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  row: String,
  seatNumber: Number,
  available: {
    type: Boolean,
    default: true,
  },
});

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    index: true,
  },
  country: {
    type: String,
    required: true,
    index: true,
  },
  hasSeatMap: {
    type: Boolean,
    default: false,
  },
  seatMap: {
    type: [seatSchema],
    default: undefined,
  },
  capacity: {
    type: Number,
  },
});

venueSchema.index({ city: 1, name: 1 }, { unique: true });

const Venue = new mongoose.model('Venue', venueSchema);

module.exports = Venue;
