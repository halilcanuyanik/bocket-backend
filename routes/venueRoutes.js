const express = require('express');
const venueController = require('../controllers/venueController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(venueController.getVenues)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    venueController.createVenue
  );

router.route('/search').get(venueController.search);

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
