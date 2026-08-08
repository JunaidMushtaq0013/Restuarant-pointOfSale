import { NextFunction, Request, Response } from "express";
import { getDashboardService } from "./dashboard.service.js";

export const getDashboardController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dashboard = await getDashboardService();

    res.status(200).json({
      status: "success",
      message: "Dashboard data retrieved successfully.",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};