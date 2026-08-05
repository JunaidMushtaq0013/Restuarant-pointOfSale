import { Router } from "express";

import {
  createMenuController,
  getAllMenuController,
  getAllMenuActiveController,
  getMenuByIdController,
  updateMenuController,
  toggleMenuActiveController,
  deleteMenuController,
} from "./menu.controller.js";

const router = Router();

router.post("/", createMenuController);

router.get("/", getAllMenuController);

router.get("/active", getAllMenuActiveController);

router.get("/:id", getMenuByIdController);

router.patch("/:id", updateMenuController);

router.patch("/:id/toggle-active", toggleMenuActiveController);

router.delete("/:id", deleteMenuController);

export default router;