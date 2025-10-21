const mongoose = require('mongoose');

const performerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatarImage: {
    type: String,
    default: '/uploads/performers/default-avatar.jpg',
  },
});

const Performer = new mongoose.model('Performer', performerSchema);

module.exports = Performer;
