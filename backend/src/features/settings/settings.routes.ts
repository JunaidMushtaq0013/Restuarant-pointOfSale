import { Router } from "express";
import {
  getSettingsController,
  updateSettingsController,
} from "./settings.controller.js";

const router = Router();

router.get("/", getSettingsController);

router.patch("/", updateSettingsController);

export default router;