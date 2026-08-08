import { Router } from "express";

import {
  createCustomerController,
  getAllCustomersController,
  getAllActiveCustomersController,
  getCustomerByIdController,
  updateCustomerController,
  toggleCustomerActiveController,
  deleteCustomerController,
} from "./customer.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("Manager", "Cashier", "Waiter"),
  createCustomerController,
);

router.get(
  "/",
  authenticate,
  authorize("Manager", "Cashier", "Waiter"),
  getAllCustomersController,
);

router.get(
  "/active",
  authenticate,
  authorize("Manager", "Cashier", "Waiter"),
  getAllActiveCustomersController,
);

router.get(
  "/:id",
  authenticate,
  authorize("Manager", "Cashier", "Waiter"),
  getCustomerByIdController,
);

router.patch(
  "/:id",
  authenticate,
  authorize("Manager", "Cashier"),
  updateCustomerController,
);

router.patch(
  "/:id/toggle-active",
  authenticate,
  authorize("Manager"),
  toggleCustomerActiveController,
);

router.delete(
  "/:id",
  authenticate,
  authorize("Manager"),
  deleteCustomerController,
);

export default router;