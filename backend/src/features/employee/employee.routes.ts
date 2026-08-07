import { Router } from "express";
import {
  createEmployeeController,
  getEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
  updateEmployeeStatusController,
} from "./employee.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.post("/", createEmployeeController);

router.get(
  "/",
  authenticate,
  authorize("Manager"),
  getEmployeesController
);

router.get("/:id", getEmployeeByIdController);

router.patch("/:id", updateEmployeeController);

router.patch("/:id/status", updateEmployeeStatusController);

export default router;