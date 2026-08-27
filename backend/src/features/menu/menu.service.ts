import { Menu } from "./menu.model.js";
import { MenuType } from "./menu.types.js";
import { Inventory } from "../inventory/inventory.model.js";
import { Category } from "../category/category.model.js";

export const createMenuService = async (payload: MenuType) => {
  const inventory = await Inventory.findById(payload.inventory);

  if (!inventory) {
    throw new Error("Inventory item not found.");
  }

  if (inventory.itemType !== "Ready Item") {
    throw new Error("Only Ready Items can be added to the menu.");
  }

  const category = await Category.findById(payload.category);

  if (!category) {
    throw new Error("Category not found.");
  }

  const menu = await Menu.create(payload);

  return menu;
};

export const getPublicMenuService = async () => {
  return await Menu.find({ isActive: true })
    .sort({ createdAt: -1 })
    .populate("category");
};

export const getAllMenuActiveService = async (
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  const [menu, total] = await Promise.all([
    Menu.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("inventory")
      .populate("category"),

    Menu.countDocuments({ isActive: true }),
  ]);

  return {
    menu,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAllMenuService = async () => {
  return await Menu.find()
    .sort({ createdAt: -1 })
    .populate("inventory")
    .populate("category");
};

export const getMenuByIdService = async (id: string) => {
  const menu = await Menu.findById(id)
    .populate("inventory")
    .populate("category");

  if (!menu) {
    throw new Error("Menu not found.");
  }

  return menu;
};

export const updateMenuService = async (
  id: string,
  payload: Partial<MenuType>
) => {
  const menu = await Menu.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("inventory")
    .populate("category");

  if (!menu) {
    throw new Error("Menu not found.");
  }

  return menu;
};

export const toggleMenuActiveService = async (id: string) => {
  const menu = await Menu.findById(id);

  if (!menu) {
    throw new Error("Menu not found.");
  }

  menu.isActive = !menu.isActive;

  return await menu.save();
};

export const deleteMenuService = async (id: string) => {
  const menu = await Menu.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!menu) {
    throw new Error("Menu not found.");
  }

  return menu;
};