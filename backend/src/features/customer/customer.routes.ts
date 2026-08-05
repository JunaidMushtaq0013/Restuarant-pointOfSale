import { Router } from "express";

import {
  createCustomerController,
  getAllCustomersController,
  getAllActiveCustomersController,
  getCustomerByIdController,
  updateCustomerController,
  toggleCustomerActiveController,
  deleteCustomerController,
} from "./customer.controller.js";

const router = Router();

router.post("/", createCustomerController);

router.get("/", getAllCustomersController);

router.get("/active", getAllActiveCustomersController);

router.get("/:id", getCustomerByIdController);

router.patch("/:id", updateCustomerController);

router.patch("/:id/toggle-active", toggleCustomerActiveController);

router.delete("/:id", deleteCustomerController);

export default router;