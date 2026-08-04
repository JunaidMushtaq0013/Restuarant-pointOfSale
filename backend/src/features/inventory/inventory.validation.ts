import { z } from "zod";

export const createInventorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, {
        message: "Inventory name must be at least 2 characters long.",
      })
      .max(100, {
        message: "Inventory name cannot exceed 100 characters.",
      }),

    unit: z.enum(["kg", "g", "l", "ml", "pcs"]),

    quantity: z
      .number()
      .min(0, {
        message: "Quantity cannot be negative.",
      }),

    minimumStock: z
      .number()
      .min(0, {
        message: "Minimum stock cannot be negative.",
      }),

    buyingPrice: z
      .number()
      .min(0, {
        message: "Buying price cannot be negative.",
      }),
  })
  .strict();