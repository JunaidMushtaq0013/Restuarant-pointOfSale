import { z } from "zod";

export const createTableSchema = z.object({
  tableNumber: z.number().int().positive(),
  capacity: z.number().int().positive(),
});

export const updateTableSchema = z.object({
  tableNumber: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
});