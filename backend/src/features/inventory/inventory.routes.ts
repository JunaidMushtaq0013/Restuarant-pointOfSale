import { Router } from "express";
import {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
} from "./inventory.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("Manager"),
  createInventory,
);

router.get(
  "/",
  authenticate,
  authorize("Manager", "Chef"),
  getAllInventory,
);

router.get(
  "/:id",
  authenticate,
  authorize("Manager", "Chef"),
  getInventoryById,
);

router.patch(
  "/:id",
  authenticate,
  authorize("Manager"),
  updateInventory,
);

router.delete(
  "/:id",
  authenticate,
  authorize("Manager"),
  deleteInventory,
);

export default router;