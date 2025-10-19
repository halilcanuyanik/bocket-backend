const express = require('express');
const authController = require('../controllers/authController');
const eventController = require('../controllers/eventController');
// const uploadController = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/upcoming-five')
  .get(eventController.upcomingFive, eventController.getEvents);

router
  .route('/')
  .get(eventController.getEvents)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    eventController.createEvent
  );

router
  .route('/:id')
  .get(eventController.getEvent)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    eventController.updateEvent
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    eventController.deleteEvent
  );

module.exports = router;
