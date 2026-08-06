import { z } from "zod";

export const updateSettingsSchema = z.object({
  restaurantName: z
    .string()
    .trim()
    .min(1, "Restaurant name is required."),

  gstPercentage: z
    .number()
    .min(0, "GST cannot be negative."),

  serviceChargePercentage: z
    .number()
    .min(0, "Service charge cannot be negative."),

  currency: z
    .string()
    .trim()
    .min(1, "Currency is required."),

  invoiceFooter: z
    .string()
    .trim()
    .min(1, "Invoice footer is required."),
});