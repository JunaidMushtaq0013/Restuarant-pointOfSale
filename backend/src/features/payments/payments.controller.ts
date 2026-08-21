import { NextFunction, Request, Response } from "express";
import {
  createRazorpayOrderService,
  verifyRazorpayPaymentService,
} from "./payments.service.js";


export const createRazorpayOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required.",
      });
    }

    const result =
      await createRazorpayOrderService(orderId);

    res.status(201).json({
      status: "success",
      message: "Razorpay order created successfully.",
      data: {
        razorpayOrder: result.razorpayOrder,
        order: result.order,
      },
    });
  } catch (error) {
    next(error);
  }
};



export const verifyRazorpayPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    const order =
      await verifyRazorpayPaymentService(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      );

    res.status(200).json({
      status: "success",
      message: "Payment verified successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};