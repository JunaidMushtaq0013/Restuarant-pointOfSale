import { Router } from "express";
import {
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
} from "./payments.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
const router = Router();

router.post(
  "/razorpay/create-order",
  authenticate,
  authorize("Manager", "Cashier"),
  createRazorpayOrderController,
);

router.post(
  "/razorpay/verify",
  authenticate,
  authorize("Manager", "Cashier"),
  verifyRazorpayPaymentController,
);

export default router;
