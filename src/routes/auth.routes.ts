import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getProfile);

export default router;
