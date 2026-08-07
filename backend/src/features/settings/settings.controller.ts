import { Request, Response } from "express";
import {
  getSettingsService,
  updateSettingsService,
} from "./settings.service.js";

export const getSettingsController = async (
  req: Request,
  res: Response
) => {
  const settings = await getSettingsService();

  res.status(200).json({
    status: "success",
    message: "Settings retrieved successfully.",
    data: settings,
  });
};

export const updateSettingsController = async (
  req: Request,
  res: Response
) => {
  const settings = await updateSettingsService(req.body);

  res.status(200).json({
    status: "success",
    message: "Settings updated successfully.",
    data: settings,
  });
};