import { Router } from "express";
import {
  createTableController,
  getTablesController,
  getTableByIdController,
  updateTableController,
  deleteTableController,
  updateTableStatusController,
} from "./tables.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("Manager"),
  createTableController,
);

router.get(
  "/",
  authenticate,
  authorize("Manager", "Cashier", "Waiter"),
  getTablesController,
);

router.get(
  "/:id",
  authenticate,
  authorize("Manager", "Cashier", "Waiter"),
  getTableByIdController,
);

router.patch(
  "/:id",
  authenticate,
  authorize("Manager"),
  updateTableController,
);

router.delete(
  "/:id",
  authenticate,
  authorize("Manager"),
  deleteTableController,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("Manager", "Cashier"),
  updateTableStatusController,
);

export default router;