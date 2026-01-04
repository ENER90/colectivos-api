import { Request, Response, NextFunction } from "express";
import { Driver } from "../models/driver.model";
import { Passenger } from "../models/passenger.model";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getNearbyPassengers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    if (!latitude || !longitude) {
      throw new AppError("Latitude and longitude are required", 400);
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const distance = parseInt(maxDistance as string, 10);

    if (
      isNaN(lat) ||
      isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      throw new AppError("Invalid coordinates", 400);
    }

    const passengers = await Passenger.find({
      isWaiting: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
          $maxDistance: distance,
        },
      },
    }).limit(20);

    const passengersData = passengers.map((p) => ({
      id: p._id,
      username: p.username,
      location: {
        latitude: p.location.coordinates[1],
        longitude: p.location.coordinates[0],
      },
      timestamp: p.timestamp,
    }));

    res.status(200).json({
      message: "Nearby passengers retrieved successfully",
      count: passengersData.length,
      passengers: passengersData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriverStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const username = req.user?.email.split("@")[0];
    const { latitude, longitude, availableSeats } = req.body;

    if (!latitude || !longitude || availableSeats === undefined) {
      throw new AppError(
        "Latitude, longitude, and availableSeats are required",
        400
      );
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new AppError("Invalid coordinates", 400);
    }

    if (availableSeats < 0 || availableSeats > 4) {
      throw new AppError("Available seats must be between 0 and 4", 400);
    }

    const existingDriver = await Driver.findOne({ userId });

    if (existingDriver) {
      existingDriver.location.coordinates = [longitude, latitude];
      existingDriver.availableSeats = availableSeats;
      existingDriver.isActive = availableSeats > 0;
      existingDriver.timestamp = new Date();
      await existingDriver.save();

      res.status(200).json({
        message: "Driver status updated successfully",
        driver: {
          id: existingDriver._id,
          username: existingDriver.username,
          location: {
            latitude,
            longitude,
          },
          availableSeats: existingDriver.availableSeats,
          isActive: existingDriver.isActive,
          timestamp: existingDriver.timestamp,
        },
      });
    } else {
      const driver = await Driver.create({
        userId,
        username: username || "driver",
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        availableSeats,
        isActive: availableSeats > 0,
        timestamp: new Date(),
      });

      res.status(201).json({
        message: "Driver status created successfully",
        driver: {
          id: driver._id,
          username: driver.username,
          location: {
            latitude,
            longitude,
          },
          availableSeats: driver.availableSeats,
          isActive: driver.isActive,
          timestamp: driver.timestamp,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
