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

module.exports = router;
