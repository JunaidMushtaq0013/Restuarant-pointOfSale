import { z } from "zod";

export const createMenuSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, {
        message: "Menu name must be at least 2 characters long.",
      })
      .max(100, {
        message: "Menu name cannot exceed 100 characters.",
      }),

    inventory: z.string().trim().min(1, {
      message: "Inventory is required.",
    }),

    category: z.string().trim().min(1, {
      message: "Category is required.",
    }),

    sellingPrice: z
      .number()
      .min(0, {
        message: "Selling price cannot be negative.",
      }),

    type: z.enum(["Veg", "Non-Veg"]),

    isActive: z.boolean().optional(),
  })
  .strict();

export const updateMenuSchema = createMenuSchema.partial();