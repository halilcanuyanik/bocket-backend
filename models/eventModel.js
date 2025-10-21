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
    coverImage: {
      type: String,
      default: '/uploads/events/default-cover.jpg',
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const Event = new mongoose.model('Event', eventSchema);

module.exports = Event;
