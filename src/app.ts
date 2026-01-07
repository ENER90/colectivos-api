import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware";
import {
  getDatabaseStatus,
  databaseHealthCheck,
} from "./middlewares/database.middleware";
import authRoutes from "./routes/auth.routes";
import passengerRoutes from "./routes/passenger.routes";
import driverRoutes from "./routes/driver.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/passengers", passengerRoutes);
app.use("/api/drivers", driverRoutes);

app.get("/health", (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.status === "connected";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "OK" : "DEGRADED",
    message: "Colectivos API is running",
    services: {
      api: "OK",
      database: dbStatus.status,
    },
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/database", databaseHealthCheck);

app.get("/api", (req, res) => {
  res.status(200).json({
    message: "Real-time Colectivos API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      database: "GET /api/database",
      api: "GET /api",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/me (requires auth)",
      },
      passengers: {
        waiting: "POST /api/passengers/waiting (requires auth, geolocation)",
        cancelWaiting: "DELETE /api/passengers/waiting (requires auth)",
      },
      drivers: {
        nearby: "GET /api/drivers/nearby (requires auth, geolocation)",
        updateStatus: "PUT /api/drivers/status (requires auth)",
      },
    },
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

export default app;
