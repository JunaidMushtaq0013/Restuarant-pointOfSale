import { Schema, model } from "mongoose";
import { SettingsType } from "./settings.types.js";

const settingsSchema = new Schema<SettingsType>(
  {
    restaurantName: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },

    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    initials: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3,
    },

    restaurantAddress: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },

    currency: {
      type: String,
      required: true,
      default: "₹",
      trim: true,
    },

    gstNumber: {
      type: String,
      required: true,
      default: "",
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

    openingTime: {
      type: String,
      required: true,
      default: "09:00",
    },

    closingTime: {
      type: String,
      required: true,
      default: "22:00",
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
