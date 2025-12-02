const express = require('express');
const venueController = require('../controllers/venueController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/search')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    venueController.search
  );

router
  .route('/update-seatmap/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    venueController.updateSeatMap
  );

router
  .route('/')
  .get(venueController.getVenues)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    venueController.createVenue
  );

router
  .route('/:id')
  .get(venueController.getVenue)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    venueController.updateVenue
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    venueController.deleteVenue
  );

module.exports = router;
