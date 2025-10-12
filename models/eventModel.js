const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
      values: ['concert', 'theatre', 'festival', 'stand up', 'other'],
      message:
        'The category should be either concert, theatre, festival, stand up and other',
    },
    required: [true, 'An event must have a category'],
    select: false,
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
  coverImage: {
    type: String,
    default: '/uploads/events/default-cover.jpg',
    select: false,
  },
  gallery: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Event = new mongoose.model('Event', eventSchema);

module.exports = Event;
