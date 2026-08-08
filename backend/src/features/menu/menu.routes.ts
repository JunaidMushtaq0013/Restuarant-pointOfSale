import { Router } from "express";

import {
  createMenuController,
  getAllMenuController,
  getAllMenuActiveController,
  getMenuByIdController,
  updateMenuController,
  toggleMenuActiveController,
  deleteMenuController,
} from "./menu.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("Manager"),
  createMenuController,
);

router.get(
  "/",
  authenticate,
  authorize("Manager", "Cashier", "Waiter", "Chef"),
  getAllMenuController,
);

router.get(
  "/active",
  authenticate,
  authorize("Manager", "Cashier", "Waiter", "Chef"),
  getAllMenuActiveController,
);

router.get(
  "/:id",
  authenticate,
  authorize("Manager", "Cashier", "Waiter", "Chef"),
  getMenuByIdController,
);

router.patch(
  "/:id",
  authenticate,
  authorize("Manager"),
  updateMenuController,
);

router.patch(
  "/:id/toggle-active",
  authenticate,
  authorize("Manager"),
  toggleMenuActiveController,
);

router.delete(
  "/:id",
  authenticate,
  authorize("Manager"),
  deleteMenuController,
);

export default router;