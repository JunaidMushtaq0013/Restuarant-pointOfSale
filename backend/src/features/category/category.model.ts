import {model,Schema} from "mongoose";

import { CategoryType } from "./category.types.js";



const categorySchema = new Schema<CategoryType>({
    name: {type: String, required: true,trim: true,unique: true},
    description: {type: String, trim: true},
    isActive: {type: Boolean, default: true}
},{
    timestamps: true,
});


export const Category =model<CategoryType>(
    "Category", categorySchema
);