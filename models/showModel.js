const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A show must have a title'],
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
    required: [true, 'A show must have a category'],
    select: false,
  },
  coverImage: {
    type: String,
    default:
      'https://raw.githubusercontent.com/halilcanuyanik/bocket-assets/main/showCovers/default.png',
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

showSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'performers',
    select: 'name avatarImage',
  });
  next();
});

const Show = new mongoose.model('Show', showSchema);

module.exports = Show;
