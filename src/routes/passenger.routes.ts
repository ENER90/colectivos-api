import { Router } from "express";
import {
  markAsWaiting,
  getAllWaitingPassengers,
  cancelWaiting,
} from "../controllers/passenger.controller";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/waiting",
  authenticateToken,
  getAllWaitingPassengers
);

router.post(
  "/waiting",
  authenticateToken,
  requireRole("passenger"),
  markAsWaiting
);

router.delete(
  "/waiting",
  authenticateToken,
  requireRole("passenger"),
  cancelWaiting
);

export default router;
