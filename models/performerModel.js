const mongoose = require('mongoose');

const performerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatarImage: {
    type: String,
    default: '/uploads/events/default-cover.jpg',
  },
});

const Performer = new mongoose.model('Performer', performerSchema);

module.exports = Performer;
