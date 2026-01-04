import { Router } from "express";
import {
  markAsWaiting,
  cancelWaiting,
} from "../controllers/passenger.controller";
import { authenticateToken, requireRole } from "../middlewares/auth.middleware";

const router = Router();

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
