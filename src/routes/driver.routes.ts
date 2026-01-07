import { Router } from "express";
import {
  getNearbyPassengers,
  getAllActiveDrivers,
  updateDriverStatus,
} from "../controllers/driver.controller";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/active",
  authenticateToken,
  getAllActiveDrivers
);

router.get(
  "/nearby",
  authenticateToken,
  requireRole("driver"),
  getNearbyPassengers
);

router.put(
  "/status",
  authenticateToken,
  requireRole("driver"),
  updateDriverStatus
);

export default router;
