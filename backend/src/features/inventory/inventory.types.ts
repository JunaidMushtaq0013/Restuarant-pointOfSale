import { Types } from "mongoose";

export interface InventoryType {
  _id: Types.ObjectId;
  name: string;

  itemType: "Raw Material" | "Ready Item";

  unit: string;

  quantity: number;

  minimumStock: number;

  buyingPrice: number;

  isActive: boolean;
}