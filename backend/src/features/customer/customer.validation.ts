import { z } from "zod";

export const createCustomerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, {
        message: "Customer name must be at least 2 characters long.",
      })
      .max(100, {
        message: "Customer name cannot exceed 100 characters.",
      }),

    phone: z
      .string()
      .trim()
      .min(10, {
        message: "Phone number must be at least 10 characters long.",
      })
      .max(15, {
        message: "Phone number cannot exceed 15 characters.",
      }),
  })
  .strict();