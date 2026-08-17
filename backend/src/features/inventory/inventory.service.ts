import {InventoryType} from "./inventory.types.js";

import {Inventory} from "./inventory.model.js";


export const createInventoryService = async(payload: InventoryType) => {
    const inventory = await Inventory.create(payload);
    return inventory;
};


export const getAllInventoryService = async (
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const [inventory, total] = await Promise.all([
    Inventory.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Inventory.countDocuments({ isActive: true }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    inventory,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

export const getInactiveInventoryService = async () => {
  return await Inventory.find({
    isActive: false,
  }).sort({ createdAt: -1 });
};



export const getInventoryByIdService = async(id: string) => {
    const inventory = await Inventory.findById(id);
    return inventory;
};
export const activateInventoryService = async (id: string) => {
  const inventory = await Inventory.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  );

  if (!inventory) {
    throw new Error("Inventory item not found.");
  }

  return inventory;
};

export const updateInventoryService = async(id: string,  payload:Partial<InventoryType>) => {
    const inventory = await Inventory.findByIdAndUpdate(id,payload, 
    {new:true, runValidators:true});
    return inventory;
    
};
export const deleteInventoryService = async (id: string) => {
  return await Inventory.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    {
      new: true,
    }
  );
};