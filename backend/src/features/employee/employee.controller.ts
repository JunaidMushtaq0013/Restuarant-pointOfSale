import { Request, Response } from "express";
import {
  createEmployeeService,
  getEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
  updateEmployeeStatusService,
} from "./employee.service.js";

export const createEmployeeController = async (
  req: Request,
  res: Response
) => {
  const employee = await createEmployeeService(req.body);

  res.status(201).json({
    status: "success",
    message: "Employee created successfully.",
    data: employee,
  });
};

export const getEmployeesController = async (
  req: Request,
  res: Response
) => {
  const employees = await getEmployeesService();

  res.status(200).json({
    status: "success",
    message: "Employees retrieved successfully.",
    data: employees,
  });
};

export const getEmployeeByIdController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const employee = await getEmployeeByIdService(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Employee retrieved successfully.",
    data: employee,
  });
};

export const updateEmployeeController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const employee = await updateEmployeeService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: "success",
    message: "Employee updated successfully.",
    data: employee,
  });
};

export const updateEmployeeStatusController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const employee = await updateEmployeeStatusService(
    req.params.id
  );

  res.status(200).json({
    status: "success",
    message: "Employee deactivated successfully.",
    data: employee,
  });
};