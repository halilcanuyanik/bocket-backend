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
  category: {
    type: String,
    enum: {
      values: ['concert', 'theatre', 'festival', 'stand up', 'gala', 'other'],
      message:
        'The category should be either concert, theatre, festival, stand up, gala and other',
    },
    required: [true, 'An event must have a category'],
    select: false,
  },
  coverImage: {
    type: String,
    default:
      'https://raw.githubusercontent.com/halilcanuyanik/bocket-assets/main/eventCovers/default.png',
  },
  organizatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    select: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    select: false,
  },
  performers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Performer' }],
  averageRating: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    select: false,
  },
  updatedAt: {
    type: Date,
    select: false,
  },
});

eventSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'performers',
    select: 'name avatarImage',
  });
  next();
});

const Event = new mongoose.model('Event', eventSchema);

module.exports = Event;
