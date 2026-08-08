import { Router } from "express";
import {
  loginController,
  getMeController,
  logoutController,
} from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

router.post("/login", loginController);

router.get("/me", authenticate, getMeController);

router.post("/logout", authenticate, logoutController);

export default router;