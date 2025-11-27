const express = require('express');
const performerController = require('../controllers/performerController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/search')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    performerController.search
  );

router
  .route('/')
  .get(performerController.getPerformers)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    performerController.createPerformer
  );

router
  .route('/:id')
  .get(performerController.getPerformer)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    performerController.updatePerformer
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    performerController.deletePerformer
  );

module.exports = router;
