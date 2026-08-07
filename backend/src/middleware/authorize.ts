import { NextFunction, Request, Response } from "express";

export const authorize = (...roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!roles.includes(req.user.role)) {
      throw new Error("You are not authorized to access this resource.");
    }

    next();
  };
};