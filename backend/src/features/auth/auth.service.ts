import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Employee } from "../employee/employee.model.js";
import { LoginType } from "./auth.types.js";

export const loginService = async (payload: LoginType) => {
  const employee = await Employee.findOne({
    email: payload.email,
  }).select("+password");

  if (!employee) {
    throw new Error("Invalid email or password.");
  }

  if (!employee.isActive) {
    throw new Error("Employee account is inactive.");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    employee.password
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid email or password.");
  }

  const token = jwt.sign(
    {
      employeeId: employee._id,
      role: employee.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    }
  );

  const employeeData = await Employee.findById(employee._id);

  return {
    token,
    employee: employeeData,
  };
};

export const getMeService = async (employeeId: string) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  if (!employee.isActive) {
    throw new Error("Employee account is inactive.");
  }

  return employee;
};