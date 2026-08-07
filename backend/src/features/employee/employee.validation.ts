import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters."),

  email: z
    .string()
    .trim()
    .email("Invalid email address."),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits."),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),

  role: z.enum([
    "Manager",
    "Cashier",
    "Chef",
    "Waiter",
  ]),
});