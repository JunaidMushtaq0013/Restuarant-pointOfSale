import { Router } from "express";
import { createOrderController, getAllOrdersController, getOrderByIdController, updateOrderStatusController, updatePaymentStatusController } from "./orders.controller.js";


const router = Router();

router.post("/", createOrderController);

router.get("/", getAllOrdersController);

router.get("/:id", getOrderByIdController);

router.patch("/:id/status", updateOrderStatusController);

router.patch("/:id/payment-status", updatePaymentStatusController);

export default router;