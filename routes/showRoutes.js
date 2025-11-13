const express = require('express');
const authController = require('../controllers/authController');
const showController = require('../controllers/showController');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.route('/search').get(eventController.search);

router
  .route('/events')
  .get(eventController.getAllEvents)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    eventController.createEvent
  );

router
  .route('/topRated')
  .get(eventController.topRated, eventController.getAllEvents);

router.get('/upcoming', eventController.upcoming, eventController.getAllEvents);

router.get(
  '/almostSoldOut',
  eventController.almostSoldOut,
  eventController.getAllEvents
);

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
    showController.createShow
  );

module.exports = router;
