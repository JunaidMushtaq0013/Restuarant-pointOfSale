import { NextFunction, Request, Response } from "express";
import { getMeService, loginService } from "./auth.service.js";

export const loginController = async (
  req: Request,
  res: Response,
) => {
  const result = await loginService(req.body);

  res.cookie("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    message: "Login successful.",
    data: {
      employee: result.employee,
    },
  });
};

export const getMeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const employee = await getMeService(req.user.employeeId);

    res.status(200).json({
      status: "success",
      message: "Current employee retrieved successfully.",
      data: {
        employee,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const logoutController = async (
  req: Request,
  res: Response,
) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    status: "success",
    message: "Logout successful.",
  });
};