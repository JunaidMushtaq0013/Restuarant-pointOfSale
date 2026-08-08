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
router.post(
  "/",
  authenticate,
  authorize("Manager"),
  createEmployeeController,
);

router.get(
  "/",
  authenticate,
  authorize("Manager"),
  getEmployeesController,
);

router.get(
  "/:id",
  authenticate,
  authorize("Manager"),
  getEmployeeByIdController,
);

router.patch(
  "/:id",
  authenticate,
  authorize("Manager"),
  updateEmployeeController,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("Manager"),
  updateEmployeeStatusController,
);

export default router;