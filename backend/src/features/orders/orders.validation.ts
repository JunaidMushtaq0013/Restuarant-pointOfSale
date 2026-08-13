import { z } from "zod";

const orderItemSchema = z.object({
  menu: z.string().trim().min(1, {
    message: "Menu item is required.",
  }),

  quantity: z.number().int().min(1, {
    message: "Quantity must be at least 1.",
  }),
});

export const createOrderSchema = z
  .object({
    customer: z.string().trim().optional(),

    customerName: z
      .string()
      .trim()
      .min(2, {
        message: "Customer name must be at least 2 characters.",
      })
      .max(100, {
        message: "Customer name cannot exceed 100 characters.",
      })
      .optional(),

    customerPhone: z
      .string()
      .trim()
      .min(10, {
        message: "Phone number must be at least 10 digits.",
      })
      .max(15, {
        message: "Phone number cannot exceed 15 digits.",
      })
      .optional(),

    items: z
      .array(orderItemSchema)
      .min(1, {
        message: "At least one menu item is required.",
      }),

    orderType: z.enum(["Dine In", "Takeaway"]),

    table: z.string().trim().min(1).nullable().optional(),

    discountPercentage: z
      .number()
      .min(0)
      .max(100)
      .default(0),

    paymentStatus: z.enum(["Pending", "Paid"]),
  })
  .strict();

export const updateOrderSchema =
  createOrderSchema.partial();