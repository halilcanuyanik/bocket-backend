const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: false,
      validate: {
        validator: function (val) {
          return !val || val > this.startTime;
        },
        message: 'End time must be after the start time',
      },
    },
    availableTickets: {
      type: Number,
      default: undefined,
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
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.show = ret.showId;
        ret.venue = ret.venueId;
        delete ret.showId;
        delete ret.venueId;
        return ret;
      },
    },
  }
);

eventSchema.pre('save', async function (next) {
  if (this.isNew && !this.availableTickets) {
    const Venue = mongoose.model('Venue');
    const venue = await Venue.findById(this.venueId).select('capacity');
    if (!venue) return next(new AppError('Venue not found', 404));
    this.availableTickets = venue.capacity;
  }
  next();
});

eventSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'showId',
    populate: {
      path: 'performers',
      select: 'name',
    },
  }).populate({
    path: 'venueId',
    // select: 'name country city address capacity',
  });
  next();
});

eventSchema.index({ showId: 1, startTime: 1 });
eventSchema.index({ venueId: 1, startTime: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
