const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'An event must have a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    artist: {
      type: String,
    },
    category: {
      type: String,
      enum: {
        values: [
          'concert',
          'theatre',
          'festival',
          'stand up',
          'workshop',
          'other',
        ],
        message:
          'The category should be either concert, sports, theatre, festival and other',
      },
      required: [true, 'An event must have a category'],
    },
    location: {
      city: String,
      venue: String,
    },
    date: {
      type: Date,
      required: [true, 'An event must have a date'],
    },
    price: {
      type: Number,
      min: [0, 'Price must be a positive number'],
    },
    ticketsAvailable: {
      type: Number,
      min: [0, 'Tickets cannot be negative'],
    },
    gallery: [String],
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above 0'],
      max: [5, 'Rating must be below 5'],
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Event = new mongoose.model('Event', eventSchema);

module.exports = Event;
