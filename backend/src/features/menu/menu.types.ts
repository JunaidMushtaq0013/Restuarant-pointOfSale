import { Types } from "mongoose";

export interface MenuType {
  name: string;

  inventory: Types.ObjectId;

  category: Types.ObjectId;

  sellingPrice: number;

  type: "Veg" | "Non-Veg";

  isActive: boolean;
}