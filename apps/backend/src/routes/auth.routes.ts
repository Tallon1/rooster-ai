import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller";

const router: ExpressRouter = Router();

// Enhanced authentication routes supporting all 4 user types
router.post("/register", register);
router.post("/login", login); // Now supports Admin, Owner, Manager, Staff
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
