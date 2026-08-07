import { Request, Response } from "express";
import { loginService } from "./auth.service.js";

export const loginController = async (
  req: Request,
  res: Response
) => {
  const result = await loginService(req.body);

  res.status(200).json({
    status: "success",
    message: "Login successful.",
    data: result,
  });
};