const express = require('express');
const authController = require('../controllers/authController');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.route('/events').get(eventController.getEvents);

module.exports = router;
