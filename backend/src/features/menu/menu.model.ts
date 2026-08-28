import { model, Schema } from "mongoose";
import { MenuType } from "./menu.types.js";

const menuSchema = new Schema<MenuType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      
    },

    inventory: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["Veg", "Non-Veg"],
      trim: true,
      required: true,
    },

    image: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Menu = model<MenuType>("Menu", menuSchema);
