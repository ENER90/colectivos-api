import { Request, Response, NextFunction } from "express";
import { Passenger } from "../models/passenger.model";
import { AppError } from "../utils/AppError";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const markAsWaiting = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const username = req.user?.email.split("@")[0];
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError("Latitude and longitude are required", 400);
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new AppError("Invalid coordinates", 400);
    }

    const existingPassenger = await Passenger.findOne({ userId });

    if (existingPassenger) {
      existingPassenger.location.coordinates = [longitude, latitude];
      existingPassenger.isWaiting = true;
      existingPassenger.timestamp = new Date();
      await existingPassenger.save();

      res.status(200).json({
        message: "Waiting status updated",
        passenger: {
          id: existingPassenger._id,
          username: existingPassenger.username,
          location: {
            latitude,
            longitude,
          },
          isWaiting: existingPassenger.isWaiting,
          timestamp: existingPassenger.timestamp,
        },
      });
    } else {
      const passenger = await Passenger.create({
        userId,
        username: username || "passenger",
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        isWaiting: true,
        timestamp: new Date(),
      });

      res.status(201).json({
        message: "Marked as waiting successfully",
        passenger: {
          id: passenger._id,
          username: passenger.username,
          location: {
            latitude,
            longitude,
          },
          isWaiting: passenger.isWaiting,
          timestamp: passenger.timestamp,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllWaitingPassengers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const passengers = await Passenger.find({}).limit(50);

    const passengersData = passengers.map((p) => ({
      id: p._id,
      username: p.username,
      location: {
        latitude: p.location.coordinates[1],
        longitude: p.location.coordinates[0],
      },
    }));

    res.status(200).json({
      message: "Waiting passengers retrieved successfully",
      count: passengersData.length,
      passengers: passengersData,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelWaiting = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const passenger = await Passenger.findOne({ userId });

    if (!passenger) {
      throw new AppError("Passenger not found", 404);
    }

    await Passenger.deleteOne({ userId });

    res.status(200).json({
      message: "Waiting status cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};
