const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    instanceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    seatNumber: {
      type: String,
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    price: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Ticket = new mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
