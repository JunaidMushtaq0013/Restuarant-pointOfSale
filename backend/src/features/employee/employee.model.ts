import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";
import { EmployeeType } from "./employee.types.js";

const employeeSchema = new Schema<EmployeeType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      
    },

   password: {
  type: String,
  required: true,
  select: false,
},

    role: {
      type: String,
      enum: ["Manager", "Cashier", "Chef", "Waiter"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

export const Employee = model<EmployeeType>(
  "Employee",
  employeeSchema
);