const mongoose = requier('mongoose');

const seatSchema = new mongoose.Schema({
  row: String,
  seatNumber: Number,
  available: {
    type: Boolean,
    default: true,
  },
});

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    hasSeatMap: {
      type: Boolean,
      default: false,
    },
    seatMap: [seatSchema],
    capacity: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Venue = new mongoose.model('Venue', venueSchema);

module.exports = Venue;
