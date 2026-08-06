import { Schema, model } from "mongoose";
import { SettingsType } from "./settings.types.js";

const settingsSchema = new Schema<SettingsType>(
  {
    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },

    gstPercentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    serviceChargePercentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "₹",
      trim: true,
    },

    invoiceFooter: {
      type: String,
      required: true,
      default: "Thank you for visiting!",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = model<SettingsType>(
  "Settings",
  settingsSchema
);