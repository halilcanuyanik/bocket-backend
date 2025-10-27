const mongoose = require('mongoose');

const eventInstanceSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    baseTicketPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const EventInstance = mongoose.model('EventInstance', eventInstanceSchema);

module.exports = EventInstance;
