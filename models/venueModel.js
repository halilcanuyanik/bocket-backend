const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'booked', 'blocked', 'vip'],
      default: 'available',
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

const stageSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true, min: 0 },
    y: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const metaSchema = new mongoose.Schema(
  {
    scale: { type: Number, default: 1 },
    version: { type: String, default: '1.0' },
  },
  { _id: false }
);

const seatMapSchema = new mongoose.Schema(
  {
    meta: {
      type: metaSchema,
      default: () => ({}),
    },
    stage: {
      type: stageSchema,
      required: true,
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
  seatMap: {
    type: seatMapSchema,
  },
  capacity: {
    type: Number,
  },
});

function calculateCapacity(seatMap) {
  let totalSeats = 0;

  if (seatMap?.groups) {
    seatMap.groups.forEach((group) => {
      if (group.grid) {
        group.grid.forEach((row) => {
          totalSeats += row.length;
        });
      }
    });
  }

  return totalSeats;
}

venueSchema.pre('save', function (next) {
  if (this.seatMap) {
    this.capacity = calculateCapacity(this.seatMap);
  }
  next();
});

venueSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
  const update = this.getUpdate();

  if (update.seatMap) {
    update.capacity = calculateCapacity(update.seatMap);
    this.setUpdate(update);
  }

  next();
});

venueSchema.index({ city: 1, name: 1 }, { unique: true });

const Venue = new mongoose.model('Venue', venueSchema);

module.exports = Venue;
