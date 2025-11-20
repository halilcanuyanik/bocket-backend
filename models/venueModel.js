const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'taken', 'blocked'],
      required: true,
    },
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    grid: {
      type: [[seatSchema]],
      required: true,
    },
  },
  { _id: false }
);

const seatMapSchema = new mongoose.Schema(
  {
    stage: {
      x: {
        type: Number,
        required: true,
        min: 0,
      },
      y: {
        type: Number,
        required: true,
        min: 0,
      },
      width: { type: Number, required: true, min: 0 },
      height: { type: Number, required: true, min: 0 },
    },
    groups: {
      type: [groupSchema],
      default: [],
    },
  },
  { _id: false }
);

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
    type: seatMapSchema,
  },
  capacity: {
    type: Number,
  },
});

venueSchema.index({ city: 1, name: 1 }, { unique: true });

const Venue = new mongoose.model('Venue', venueSchema);

module.exports = Venue;
