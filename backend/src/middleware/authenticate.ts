import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtUser } from "../features/auth/auth.types.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!,
  ) as JwtUser;

  req.user = decoded;

  next();
};