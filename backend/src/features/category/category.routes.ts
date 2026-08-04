import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";

const router = Router();

router.post("/", createCategory);

router.get("/", getAllCategories);

router.get("/:id", getCategoryById);

router.patch("/:id", updateCategory);

router.delete("/:id", deleteCategory);

export default router;