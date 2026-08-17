import { Types } from "mongoose";
import { InventoryType } from "../inventory/inventory.types.js";
export interface MenuType {
  _id: Types.ObjectId;

  name: string;

  inventory: Types.ObjectId;

  category: Types.ObjectId;

  sellingPrice: number;

  type: "Veg" | "Non-Veg";

  image?: string;

  isActive: boolean;
}

export interface PopulatedMenuType
  extends Omit<MenuType, "inventory"> {
  inventory: InventoryType;
}