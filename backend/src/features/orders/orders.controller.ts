import { Request, Response, NextFunction } from "express";
import {
  cancelOrderService,
  createOrderService,
  getAllOrdersService,
  getOrderByIdService,
  getQrOrderByTokenService,
  updateOrderStatusService,
  updatePaymentStatusService,
} from "./orders.service.js";

export const createOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const source = req.user ? "POS" : "QR";

    const payload = {
      ...req.body,

      source,

      discountPercentage:
        req.user?.role === "Cashier" || req.user?.role === "Manager"
          ? (req.body.discountPercentage ?? 0)
          : 0,

      paymentStatus:
        req.user?.role === "Waiter"
          ? "Pending"
          : req.body.paymentStatus,
    };

    const order = await createOrderService(payload);

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getQrOrderByTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;

    if (!token || Array.isArray(token)) {
      throw new Error("Order access token is required.");
    }

    const order = await getQrOrderByTokenService(token);

    res.status(200).json({
      status: "success",
      message: "QR order retrieved successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const result = await getAllOrdersService(page, limit, status);

    res.status(200).json({
      status: "success",
      message: "Orders retrieved successfully",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await getOrderByIdService(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await updateOrderStatusService(
      req.params.id,
      req.body.status,
    );

    res.status(200).json({
      status: "success",
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatusController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await updatePaymentStatusService(
      req.params.id,
      req.body.paymentStatus,
      req.user.role === "Cashier" || req.user.role === "Manager"
        ? req.body.discountPercentage
        : undefined,
    );

    res.status(200).json({
      status: "success",
      message: "Payment status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrderController = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const order = await cancelOrderService(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Order cancelled successfully",
    data: order,
  });
};
