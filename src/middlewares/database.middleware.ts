import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

interface DatabaseStatus {
  status: "connected" | "disconnected" | "connecting" | "unknown";
  readyState: number;
  host?: string;
  port?: number;
  database?: string;
}

export const getDatabaseStatus = (): DatabaseStatus => {
  const connection = mongoose.connection;
  const readyStates: { [key: number]: DatabaseStatus["status"] } = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnected",
  };

  return {
    status: readyStates[connection.readyState] || "unknown",
    readyState: connection.readyState,
    host: connection.host,
    port: connection.port,
    database: connection.name,
  };
};

export const databaseHealthCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const dbStatus = getDatabaseStatus();
    const isHealthy = dbStatus.status === "connected";

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "healthy" : "unhealthy",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
