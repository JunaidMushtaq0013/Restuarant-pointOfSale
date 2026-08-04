import { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default globalErrorHandler;