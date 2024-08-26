const express = require("express");
const fs = require("fs");
const path = require("path");
const Tour = require("../model/TourModel");
const ErrorResponse = require("../utils/ErrorResponse");

class tourController {
  static getAllTour = async (req, res, next) => {
    const filePath = path.join(__dirname, "../data/tours.json");

    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        return res.status(404).json({
          status: "fail",
          message: err,
        });
      }

      try {
        const tours = JSON.parse(data);

        res.status(200).json({
          status: "success",
          data: { tours },
        });
      } catch (error) {
        res.status(404).json({
          status: "fail",
          message: error,
        });
      }
    });
  };

  static getTour = async (req, res, next) => {
    try {
      const tour = await Tour.findById(req.params.id);

      // Check if the tour was found
      if (!tour) {
        return res.status(404).json({
          status: "fail",
          message: "Tour not found",
        });
      }

      res.status(200).json({
        status: "success",
        data: { tour },
      });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err.message,
      });
    }
  };

  static storeTour = async (req, res, next) => {
    try {
      const newTour = await Tour.create(req.body);

      res.status(201).json({
        status: "success",
        data: newTour,
      });
    } catch (err) {
      res.status(400).json({
        status: "fail",
        message: err,
      });
      console.log(err);
    }
  };

  static updateTour = async (req, res, next) => {
    try {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!tour) {
        return res.status(404).json({
          status: "fail",
          message: "No tour found with that ID",
        });
      }

      res.status(200).json({
        status: "success",
        data: { tour },
      });
    } catch (err) {
      next(new ErrorResponse("Tour did not exist"));
    }
  };

  static deleteTour = async (req, res, next) => {
    try {
      const tour = await Tour.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status: "success",
        message: "Tour deleted",
        data: null,
      });

      if (!tour) {
        return res.status(404).json({
          status: "fail",
          message: "No tour found with that ID",
        });
      }
    } catch (err) {
      next(new ErrorResponse("Tour did not exist"));
    }
  };
}

module.exports = tourController;
