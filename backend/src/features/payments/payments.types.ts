import { Types } from "mongoose";

export type PaymentMethod = "Cash" | "Online ";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refund Initiated";

export interface PaymentType {
  order: Types.ObjectId;

  amount: number;

  method: PaymentMethod;

  status: PaymentStatus;
  
  razorpayOrderId?: string;

  razorpayPaymentId?: string;

  razorpaySignature?: string;
}
