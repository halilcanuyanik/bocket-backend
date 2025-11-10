const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetType: {
    type: String,
    enum: ['show', 'performer'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
});

ratingSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

const Rating = new mongoose.model('Rating', ratingSchema);

module.exports = Rating;
