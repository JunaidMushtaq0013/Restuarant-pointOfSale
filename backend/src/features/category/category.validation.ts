import {z} from "zod";

export const createCategorySchema = z.object({
    name :z
    .string()
    .trim()
    .min(2, {message: "Name must be at least 2 characters long"})
    .max(50, {message: "Name must be at most 50 characters long"}),

    description: z
    .string()
    .trim()
    .max(200, {message: "Description must be at most 200 characters long"})
    .optional(),


}).strict();