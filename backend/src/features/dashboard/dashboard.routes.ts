import { Router } from "express";
import { getDashboardController } from "./dashboard.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("Manager", "Cashier", "Chef", "Waiter"),
  getDashboardController,
);

export default router;
