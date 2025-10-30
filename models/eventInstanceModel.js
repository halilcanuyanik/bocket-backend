const mongoose = require('mongoose');

const eventInstanceSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      validate: {
        validator: function (val) {
          return !val || val > this.startTime;
        },
        message: 'End time must be after the start time',
      },
    },
    pricing: {
      _id: false,
      base: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
  },
  { timestamps: true }
);

eventInstanceSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'eventId',
    select: 'title performers',
    populate: {
      path: 'performers',
      select: 'name',
    },
  }).populate({
    path: 'venueId',
    select: 'country city address',
  });
  next();
});

eventInstanceSchema.index({ eventId: 1, date: 1 });

const EventInstance = mongoose.model('EventInstance', eventInstanceSchema);

module.exports = EventInstance;
