import { Router } from "express";
import {
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
} from "./payments.controller.js";
const router = Router();

router.post(
  "/razorpay/create-order",
  createRazorpayOrderController,
);

router.post(
  "/razorpay/verify",
  verifyRazorpayPaymentController,
);

export default router;