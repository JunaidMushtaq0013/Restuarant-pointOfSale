import { Schema, model } from "mongoose";
import { InventoryType } from "./inventory.types.js";

const inventorySchema = new Schema<InventoryType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "l", "ml", "pcs"],
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumStock: {
      type: Number,
      required: true,
      min: 0,
    },

    buyingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Inventory = model<InventoryType>(
  "Inventory",
  inventorySchema
);