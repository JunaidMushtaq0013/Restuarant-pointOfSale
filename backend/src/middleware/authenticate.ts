import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtUser } from "../features/auth/auth.types.js";



export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new Error("Authorization token is missing.");
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    throw new Error("Invalid authorization format.");
  }

  const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET!
) as JwtUser;

req.user = decoded;


  next();
};