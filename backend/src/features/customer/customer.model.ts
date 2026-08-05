import {model,Schema} from "mongoose";
import { CustomerType } from "./customer.types.js";

const customerSchema = new Schema<CustomerType>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {timestamps: true});



export const Customer = model<CustomerType>("Customer", customerSchema);