const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema(
  {
    seatId: { type: String, required: true },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    lockedBy: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: false }
);

seatLockSchema.index({ eventId: 1, seatId: 1 }, { unique: true });

seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SeatLock = new mongoose.model('SeatLock', seatLockSchema);

module.exports = SeatLock;
