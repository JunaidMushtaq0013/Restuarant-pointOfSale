import { Router } from "express";
import {
  cancelOrderController,
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,

  updateOrderStatusController,
  updatePaymentStatusController,
} from "./orders.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("Manager", "Cashier", "Waiter"),
  createOrderController,
);


router.get(
  "/",
  authenticate,
  authorize("Manager", "Cashier", "Waiter", "Chef"),
  getAllOrdersController,
);

router.get(
  "/:id",
  authenticate,
  authorize("Manager", "Cashier", "Waiter", "Chef"),
  getOrderByIdController,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("Manager", "Cashier", "Waiter", "Chef"),
  updateOrderStatusController,
);

router.patch(
  "/:id/payment-status",
  authenticate,
  authorize("Manager", "Cashier"),
  updatePaymentStatusController,
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("Manager", "Cashier"),
  cancelOrderController,
);

export default router;
