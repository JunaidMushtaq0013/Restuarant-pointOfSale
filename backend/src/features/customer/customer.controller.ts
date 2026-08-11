import { Request, Response, NextFunction } from "express";

import {
  createCustomerService,
  getAllCustomersService,
  getAllActiveCustomersService,
  getCustomerByIdService,
  updateCustomerService,
  toggleCustomerActiveService,
  deleteCustomerService,
  getCustomerOrdersService,
} from "./customer.service.js";

export const createCustomerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await createCustomerService(req.body);

    res.status(201).json({
      status: "success",
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customers = await getAllCustomersService();

    res.status(200).json({
      status: "success",
      message: "Customers retrieved successfully",
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllActiveCustomersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customers = await getAllActiveCustomersService(
      req.query.search as string | undefined,
    );

    res.status(200).json({
      status: "success",
      message: "Active customers retrieved successfully",
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrdersController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await getCustomerOrdersService(
      req.params.id,
    );

    res.status(200).json({
      status: "success",
      message: "Customer orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await getCustomerByIdService(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Customer retrieved successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await updateCustomerService(req.params.id, req.body);

    res.status(200).json({
      status: "success",
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCustomerActiveController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await toggleCustomerActiveService(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Customer status updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = await deleteCustomerService(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Customer deleted successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};