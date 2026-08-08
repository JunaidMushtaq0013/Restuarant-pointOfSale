import { Types } from "mongoose";

export interface OrderItemType {
  menu: Types.ObjectId;

  name: string;

  price: number;

  quantity: number;

  total: number;
}

export interface OrderType {
  orderNumber: string;

  customer?: Types.ObjectId;

  customerName?: string;

  items: OrderItemType[];

  orderType: "Dine In" | "Takeaway";

  table?: Types.ObjectId | null;

  subTotal: number;

  discountPercentage: number;

  discountAmount: number;

  gstPercentage: number;

  gstAmount: number;

  serviceChargePercentage: number;

  serviceChargeAmount: number;

  grandTotal: number;

  paymentStatus: "Pending" | "Paid";

  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";

  isActive: boolean;
}

export interface CreateOrderPayload {
  customerName?: string;

  customerPhone?: string;

  items: {
    menu: Types.ObjectId;
    quantity: number;
  }[];

  orderType: "Dine In" | "Takeaway";

  table?: Types.ObjectId | null;

  discountPercentage?: number;
}
