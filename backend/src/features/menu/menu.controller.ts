import {Response,Request,NextFunction} from 'express';
import { createMenuService, getAllMenuActiveService, getAllMenuService, getMenuByIdService, toggleMenuActiveService, updateMenuService,deleteMenuService} from './menu.service.js';


export const createMenuController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;   
    const menu = await createMenuService(payload);
    res.status(201).json({
        status: "success",
        message: "Menu created successfully",
        data: menu
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMenuActiveController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const menu = await getAllMenuActiveService(); 
    res.status(200).json({
        status: "success",
        message: "Menus retrieved successfully",
        data: menu
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

export const updateMenuController = async (req: Request<{id: string}>, res: Response, next: NextFunction) => {      
    
    try {
        const payload = req.body;
        const menu = await updateMenuService(req.params.id, payload);
        res.status(200).json({
            status: "success",
            message: "Menu updated successfully",
            data: menu
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

