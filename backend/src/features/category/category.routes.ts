import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";

import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("Manager"),
  createCategory,
);

router.get(
  "/",
  authenticate,
  authorize("Manager", "Cashier", "Waiter", "Chef"),
  getAllCategories,
);

router.get(
  "/:id",
  authenticate,
  authorize("Manager", "Cashier", "Waiter", "Chef"),
  getCategoryById,
);

router.patch(
  "/:id",
  authenticate,
  authorize("Manager"),
  updateCategory,
);

router.delete(
  "/:id",
  authenticate,
  authorize("Manager"),
  deleteCategory,
);

export default router;