import {Response,Request,NextFunction} from 'express';
import { createMenuService,getPublicMenuService, getAllMenuActiveService, getAllMenuService, getMenuByIdService, toggleMenuActiveService, updateMenuService,deleteMenuService} from './menu.service.js';
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";


export const createMenuController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body;

    if (!req.file) {
      throw new Error("Menu image is required.");
    }

    const imageUrl = await uploadToCloudinary(req.file);

    const menu = await createMenuService({
      ...payload,
      sellingPrice: Number(payload.sellingPrice),
      image: imageUrl,
    });

    res.status(201).json({
      status: "success",
      message: "Menu created successfully",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicMenuController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const menu = await getPublicMenuService();

    res.status(200).json({
      status: "success",
      message: "Public menu retrieved successfully",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMenuActiveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAllMenuActiveService(page, limit);

    res.status(200).json({
      status: "success",
      message: "Menus retrieved successfully",
      data: result.menu,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllMenuController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menu = await getAllMenuService();
    res.status(200).json({
        status: "success",
        message: "Menus retrieved successfully",
        data: menu
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuByIdController = async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
  try {
    const menu = await getMenuByIdService(req.params.id);
    res.status(200).json({
        status: "success",
        message: "Menu retrieved successfully",
        data: menu
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body;

    let imageUrl: string | undefined;

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    const menu = await updateMenuService(req.params.id, {
      ...payload,
      sellingPrice: Number(payload.sellingPrice),
      ...(imageUrl && { image: imageUrl }),
    });

    res.status(200).json({
      status: "success",
      message: "Menu updated successfully",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleMenuActiveController = async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
    try {
        const menu = await toggleMenuActiveService(req.params.id);
        res.status(200).json({
            status: "success",
            message: "Menu active status toggled successfully",
            data: menu
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMenuController = async (req: Request<{id: string}>, res: Response, next: NextFunction) => {
    try {
        const menu = await deleteMenuService(req.params.id);
        res.status(200).json({
            status: "success",
            message: "Menu deleted successfully",
            data: menu
        });
    }catch (error) {
        next(error);
    }

};   

