import { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(error);

  const message =
    error instanceof Error ? error.message : "Internal Server Error";
  const statusCode =
    error instanceof Error &&
    /not found|must be|already|inactive|operative|occupied|insufficient|required/i.test(
      message,
    )
      ? 400
      : 500;

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default globalErrorHandler;
