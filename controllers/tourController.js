const express = require("express");
const fs = require("fs");
const path = require("path");
const Tour = require("../model/TourModel");
const ErrorResponse = require("../utils/ErrorResponse");
const { match } = require("assert");

class tourController {
  static getAllTour = async (req, res, next) => {
    try {
      //build query
      //filtering
      const queryObj = { ...req.query };
      const excludedFields = ["page", "limit", "sort", "fields"];
      excludedFields.forEach((el) => delete queryObj[el]);

      //advanced filtering
      let queryStr = JSON.stringify(queryObj);
      //prettier-ignore
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      console.log(JSON.parse(queryStr));

      let query = Tour.find(JSON.parse(queryStr));

      //sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query = query.sort("-ratingsAverage");
      }
      //field limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields);
      } else {
        query = query.select("-__v");
      }

      //pagination
      const page = Math.max(req.query.page * 1 || 1, 1);
      const limit = Math.max(req.query.limit * 1 || 100, 1);
      const skip = (page - 1) * limit;

      const totalDocuments = await Tour.countDocuments();
      const totalPages = Math.ceil(totalDocuments / limit);

      if (skip >= totalDocuments && totalDocuments > 0) {
        throw new Error("This page does not exist");
      }
      query = query.skip(skip).limit(limit);

      //execute query
      const tours = await query;

      res.status(200).json({
        status: "success",
        results: tours.length,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalDocuments: totalDocuments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        data: { tours },
      });
    } catch (error) {
      res.status(500).json({
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
}

module.exports = tourController;
