import { NextFunction, Request, Response, } from "express";
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
  activateCategoryService,
  getAllInactiveCategoriesService,
} from "./category.service.js";


export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await createCategoryService(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
        next(error);
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getAllCategoriesService(
  req.query.search as string | undefined,
);

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
    });
  } catch (error) {
       next(error);
  }
};

export const getAllInactiveCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories =
      await getAllInactiveCategoriesService();

    res.status(200).json({
      success: true,
      message: "Inactive categories fetched successfully.",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};


export const activateCategory = async (
  req: Request<{id:string}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category =
      await activateCategoryService(req.params.id );

    res.status(200).json({
      success: true,
      message: "Category activated successfully.",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await getCategoryByIdService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category fetched successfully.",
      data: category,
    });
  } catch (error) {
      next(error);
  }
};

export const updateCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await updateCategoryService(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
      next(error);
    
  }
};

export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await deleteCategoryService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
      data: category,
    });
  } catch (error) {
      next(error);
  }
};