const express = require('express');
const authController = require('../controllers/authController');
const eventController = require('../controllers/eventController');
const eventInstanceController = require('../controllers/eventInstanceController');

const router = express.Router();

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

router.route('/:id/instances').get(eventInstanceController.getEventInstances);

router
  .route('/instances')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    eventInstanceController.createEventInstance
  );

router
  .route('/instances/:id')
  .get(eventInstanceController.getEventInstance)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    eventInstanceController.updateEventInstance
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    eventInstanceController.deleteEventInstance
  );

module.exports = router;
