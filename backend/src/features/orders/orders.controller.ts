import {Request, Response, NextFunction} from "express";
import { createOrderService, getAllOrdersService, getOrderByIdService, updateOrderStatusService, updatePaymentStatusService } from "./orders.service.js";

export const createOrderController = async (req: Request, res: Response, next: NextFunction) => {
   try{
      const payload = req.body;

      const order = await createOrderService(payload);

      res.status(201).json({
         status:"success",
         message:"Order created successfully",
         data:order
      });
   }catch(error){
      next(error);
   }
}

export const getAllOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await getAllOrdersService();

    res.status(200).json({
      status: "success",
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const order = await updateOrderStatusService(
      req.params.id,
      req.body.status
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
  next: NextFunction
) => {
  try {
    const order = await updatePaymentStatusService(
      req.params.id,
      req.body.paymentStatus
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


