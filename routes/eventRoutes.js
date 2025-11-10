const express = require('express');
const authController = require('../controllers/authController');
const showController = require('../controllers/showController');
const eventController = require('../controllers/eventController');

const router = express.Router();

router
  .route('/events')
  .get(eventController.getAllEvents)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    eventController.createEvent
  );

router.get(
  '/upcomingEvents',
  eventController.upcomingEvents,
  eventController.getAllEvents
);

router.get(
  '/almostSoldOut',
  eventController.almostSoldOut,
  eventController.getAllEvents
);

router
  .route('/topFiveRatedShows')
  .get(eventController.topFiveRatedShows, eventController.getEvents);

router
  .route('/events/:id')
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

router.route('/:id/events').get(eventController.getEvents);

router
  .route('/:id')
  .get(showController.getShow)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    showController.updateShow
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    showController.deleteShow
  );

router
  .route('/')
  .get(showController.getShows)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    eventController.createShow
  );

module.exports = router;
