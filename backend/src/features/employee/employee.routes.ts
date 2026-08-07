import { Router } from "express";
import {
  createEmployeeController,
  getEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
  updateEmployeeStatusController,
} from "./employee.controller.js";

const router = Router();

router.post("/", createEmployeeController);

router.get("/", getEmployeesController);

router.get("/:id", getEmployeeByIdController);

router.patch("/:id", updateEmployeeController);

router.patch("/:id/status", updateEmployeeStatusController);

export default router;