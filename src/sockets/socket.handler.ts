import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyToken } from "../utils/jwt";
import { Driver } from "../models/driver.model";
import { Passenger } from "../models/passenger.model";
import { User } from "../models/user.model";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: "passenger" | "driver" | "admin";
}

interface LocationUpdate {
  latitude: number;
  longitude: number;
  availableSeats?: number;
}

interface PassengerWaiting {
  latitude: number;
  longitude: number;
}

export const initializeSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);

    const userId = socket.userId!;
    const userRole = socket.userRole!;

    await User.findByIdAndUpdate(userId, { status: "online" });

    if (userRole === "driver") {
      socket.join("drivers");
    } else if (userRole === "passenger") {
      socket.join("passengers");
    }

    socket.on("driver:location-update", async (data: LocationUpdate) => {
      try {
        if (userRole !== "driver") {
          socket.emit("error", { message: "Only drivers can update location" });
          return;
        }

        const { latitude, longitude, availableSeats } = data;

        if (typeof latitude !== "number" || typeof longitude !== "number") {
          socket.emit("error", { message: "Invalid location data" });
          return;
        }

        const updateData: any = {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          isActive: true,
        };

        if (typeof availableSeats === "number") {
          updateData.availableSeats = availableSeats;
        }

        const driver = await Driver.findOneAndUpdate(
          { userId },
          updateData,
          { new: true, upsert: true }
        ).populate("userId", "username");

        io.to("passengers").emit("driver:location-updated", {
          driverId: driver._id,
          username: (driver.userId as any).username,
          location: {
            latitude: driver.location.coordinates[1],
            longitude: driver.location.coordinates[0],
          },
          availableSeats: driver.availableSeats,
          timestamp: new Date(),
        });

        socket.emit("driver:location-update-success", {
          message: "Location updated successfully",
        });
      } catch (error) {
        console.error("Error updating driver location:", error);
        socket.emit("error", { message: "Failed to update location" });
      }
    });

    socket.on("passenger:waiting", async (data: PassengerWaiting) => {
      try {
        if (userRole !== "passenger") {
          socket.emit("error", { message: "Only passengers can mark as waiting" });
          return;
        }

        const { latitude, longitude } = data;

        if (typeof latitude !== "number" || typeof longitude !== "number") {
          socket.emit("error", { message: "Invalid location data" });
          return;
        }

        const passenger = await Passenger.findOneAndUpdate(
          { userId },
          {
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            isWaiting: true,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          },
          { new: true, upsert: true }
        ).populate("userId", "username");

        io.to("drivers").emit("passenger:new-waiting", {
          passengerId: passenger._id,
          username: (passenger.userId as any).username,
          location: {
            latitude: passenger.location.coordinates[1],
            longitude: passenger.location.coordinates[0],
          },
          timestamp: new Date(),
        });

        socket.emit("passenger:waiting-success", {
          message: "Marked as waiting successfully",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });
      } catch (error) {
        console.error("Error marking passenger as waiting:", error);
        socket.emit("error", { message: "Failed to mark as waiting" });
      }
    });

    socket.on("passenger:cancel", async () => {
      try {
        if (userRole !== "passenger") {
          socket.emit("error", { message: "Only passengers can cancel waiting" });
          return;
        }

        const passenger = await Passenger.findOneAndUpdate(
          { userId },
          { isWaiting: false },
          { new: true }
        );

        if (passenger) {
          io.to("drivers").emit("passenger:cancelled", {
            passengerId: passenger._id,
            timestamp: new Date(),
          });
        }

        socket.emit("passenger:cancel-success", {
          message: "Waiting cancelled successfully",
        });
      } catch (error) {
        console.error("Error cancelling passenger waiting:", error);
        socket.emit("error", { message: "Failed to cancel waiting" });
      }
    });

    socket.on("driver:inactive", async () => {
      try {
        if (userRole !== "driver") {
          socket.emit("error", { message: "Only drivers can set inactive status" });
          return;
        }

        await Driver.findOneAndUpdate({ userId }, { isActive: false });

        socket.emit("driver:inactive-success", {
          message: "Driver set to inactive",
        });
      } catch (error) {
        console.error("Error setting driver inactive:", error);
        socket.emit("error", { message: "Failed to set inactive" });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`❌ User disconnected: ${userId}`);

      try {
        await User.findByIdAndUpdate(userId, { status: "offline" });

        if (userRole === "driver") {
          await Driver.findOneAndUpdate({ userId }, { isActive: false });
        } else if (userRole === "passenger") {
          await Passenger.findOneAndUpdate({ userId }, { isWaiting: false });
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });

  return io;
};
