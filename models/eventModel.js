const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
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
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    eventSeatMap: {
      type: mongoose.Schema.Types.Mixed,
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
          if (!val || !this.startTime) return true;
          return new Date(val).getTime() > new Date(this.startTime).getTime();
        },
        message: 'End time must be after the start time',
      },
    },
    availableTickets: {
      type: Number,
      default: undefined,
    },
    pricing: pricingSchema,
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
    populate: { path: 'performers' },
  }).populate('venueId');

  next();
});

eventSchema.index({ showId: 1, startTime: 1 });
eventSchema.index({ venueId: 1, startTime: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
