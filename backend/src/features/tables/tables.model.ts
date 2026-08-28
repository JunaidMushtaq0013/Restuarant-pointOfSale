import { Schema, model } from "mongoose";
import { TableType } from "./tables.types.js";

const tableSchema = new Schema<TableType>(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["Available", "Occupied", "Reserved"],
      default: "Available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    qrToken: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Table = model<TableType>("Table", tableSchema);
