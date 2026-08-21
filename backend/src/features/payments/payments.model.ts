import {model,Schema, Types} from "mongoose";
import { PaymentType } from "./payments.types.js";
import { types } from "node:util";
import { number } from "zod";


const PaymentSchema = new Schema<PaymentType>({
   
   order:{
    type:Schema.Types.ObjectId,
    ref:"Order",
    required:true,
   },
   amount:{
    type:Number,
    required:true,
    min:0,

   },
   method:{
    type:String,
    enum:["Cash","Online"],
    required:true,
   },

   status:{
    type:String,
    enum:[
      "Pending",
        "Paid",
        "Failed",
        "Refund Initiated",
    ],
    default:"Pending",
   },
     razorpayOrderId: {
      type: String,
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
    },

    razorpaySignature: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);


export const Payment = model<PaymentType>(
    "Payment",
    PaymentSchema
)