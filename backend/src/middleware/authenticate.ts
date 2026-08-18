// 



///switching to local stoargae 


import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtUser } from "../features/auth/auth.types.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Check cookie first
    const cookieToken = req.cookies.token;

    // Check Authorization header
    const authHeader = req.headers.authorization;

    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    // Use cookie token if available, otherwise use header token
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as JwtUser;

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};