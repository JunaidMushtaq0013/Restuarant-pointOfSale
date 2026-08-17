import {Request, Response,NextFunction} from 'express';
import {createInventoryService,getAllInventoryService, getInventoryByIdService, updateInventoryService, deleteInventoryService, activateInventoryService, getInactiveInventoryService} from './inventory.service.js';


export const createInventory = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const inventory = await createInventoryService(req.body);
        res.status(201).json({
            status: "success",
            message: "Inventory created successfully",
            data: inventory
        });
    }
    catch(error){
        next(error);
    }

};




export const getAllInventory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAllInventoryService(page, limit);

    res.status(200).json({
      status: "success",
      message: "Inventory retrieved successfully",
      data: result.inventory,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
export const getInactiveInventory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const inventory = await getInactiveInventoryService();

    res.status(200).json({
      status: "success",
      message: "Inactive inventory retrieved successfully.",
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};


export const getInventoryById = async(req: Request<{id: string}>, res: Response, next: NextFunction) => {
    try{
        const inventory = await getInventoryByIdService(req.params.id);
        res.status(200).json({
            status: "success",
            message: "Inventory retrieved successfully",
            data: inventory
        });
    }   
    catch(error){
        next(error);
    }
};
export const activateInventory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const inventory = await activateInventoryService(
      req.params.id,
    );

    res.status(200).json({
      status: "success",
      message: "Inventory activated successfully.",
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};


export const updateInventory = async(req: Request<{id: string}>, res: Response, next: NextFunction) => {
    try{
        const inventory = await updateInventoryService(req.params.id, req.body);
        res.status(200).json({
            status: "success",
            message: "Inventory updated successfully",
            data: inventory
        });
    }
    catch(error){
        next(error);
    }
};

export const deleteInventory = async(req: Request<{id: string}>, res: Response, next: NextFunction) => {
    try{
        const inventory = await deleteInventoryService(req.params.id);
        res.status(200).json({
            status: "success",
            message: "Inventory deleted successfully",
            data: inventory
        });
    }
    catch(error){
        next(error);
    }
};