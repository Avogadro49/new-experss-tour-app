const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");

router.route("/").get(tourController.getAllTour).post(tourController.storeTour);

router.route("/tour-stats").get(tourController.getTourStats);

router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
