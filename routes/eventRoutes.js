const express = require('express');
const authController = require('../controllers/authController');
const eventController = require('../controllers/eventController');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/')
  .get(eventController.getEvents)
  .post(
    authController.protect,
    uploadController.uploadCover,
    eventController.createEvent
  );

router
  .route('/:id')
  .get(eventController.getEvent)
  .patch(authController.protect, eventController.updateEvent)
  .delete(authController.protect, eventController.deleteEvent);

module.exports = router;
