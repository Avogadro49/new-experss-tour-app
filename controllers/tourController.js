const express = require("express");
const fs = require("fs");
const path = require("path");
const Tour = require("../model/TourModel");
const ErrorResponse = require("../utils/ErrorResponse");
const APIFeatures = require("../utils/APIFeatures");

class tourController {
  static getAllTour = async (req, res, next) => {
    try {
      const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields();

      await features.paginate();
      //execute query
      const tours = await features.query;

      res.status(200).json({
        status: "success",
        results: tours.length,
        pagination: features.pagination,
        data: { tours },
      });
    } catch (error) {
      res.status(400).json({
        status: "fail",
        message: "Error processing the file",
      });
    }
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

  static getTourStats = async (req, res) => {
    try {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
          $group: {
            _id: "$difficulty",
            numTours: { $sum: 1 },
            numRating: { $sum: "$ratingsQuantity" },
            avgRating: { $avg: "$ratingsAverage" },
            avgPrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]);
      res.status(200).json({
        status: "success",
        data: { stats },
      });
    } catch (err) {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    }
  };

  static getMonthlyPlan = async (req, res) => {
    try {
      const year = req.params.year * 1;
      const plan = await Tour.aggregate([
        {
          $unwind: "$startDates",
        },
        {
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$startDates" },
            numToursStarts: { $sum: 1 },
            tours: { $push: "$name" },
          },
        },
        {
          $addFields: { month: "$_id" },
        },
        {
          $project: { _id: 0 },
        },
        {
          $sort: { numToursStarts: -1 },
        },
      ]);
      res.status(200).json({
        status: "success",
        results: plan.length,
        data: { plan },
      });
    } catch (err) {
      res.status(400).json({
        status: "fail",
        message: err,
      });
    }
  };
}

module.exports = tourController;
