import { Router } from "express";

import {
  getSettingsController,
  getPublicSettingsController,
  updateSettingsController,
} from "./settings.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import upload from "../../middleware/upload.js";

const router = Router();

router.get(
  "/public",
  getPublicSettingsController,
);

router.get(
  "/",
  authenticate,
  authorize("Manager", "Cashier", "Waiter", "Chef"),
  getSettingsController,
);

router.patch(
  "/",
  authenticate,
  authorize("Manager"),
  upload.single("logo"),
  updateSettingsController,
);

export default router;