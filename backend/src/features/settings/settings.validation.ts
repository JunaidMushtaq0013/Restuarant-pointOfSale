import { z } from "zod";

export const updateSettingsSchema = z.object({
  restaurantName: z
    .string()
    .trim()
    .min(1, "Restaurant name is required."),

  logoUrl: z
    .string()
    .trim()
    .optional()
    .default(""),

  initials: z
    .string()
    .trim()
    .max(3, "Initials can be up to 3 characters.")
    .optional()
    .default(""),

  restaurantAddress: z
    .string()
    .trim()
    .min(1, "Restaurant address is required."),

  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required."),

  email: z
    .string()
    .trim()
    .email("Invalid email address."),

  currency: z
    .string()
    .trim()
    .min(1, "Currency is required."),

  gstNumber: z
    .string()
    .trim()
    .min(1, "GST number is required."),

  gstPercentage: z
    .number()
    .min(0, "GST percentage cannot be negative."),

  serviceChargePercentage: z
    .number()
    .min(0, "Service charge percentage cannot be negative."),

  openingTime: z
    .string()
    .trim()
    .min(1, "Opening time is required."),

  closingTime: z
    .string()
    .trim()
    .min(1, "Closing time is required."),

  invoiceFooter: z
    .string()
    .trim()
    .min(1, "Invoice footer is required."),
});
