import { Types } from "mongoose";

export interface OrderItemType {
  menu: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  total: number;
  note?: string;
}

export interface OrderType {
  orderNumber: string;

  source: "QR" | "POS";

  customer?: Types.ObjectId;
  customerName?: string;

  orderAccessToken?: string;

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

  paymentMethod: "Cash" | "Online";

  paymentStatus: "Pending" | "Paid" | "Refund Initiated";

  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderPayload {
  source: "QR" | "POS";

  customerName?: string;
  customerPhone?: string;

  items: {
    menu: Types.ObjectId;
    quantity: number;
    note?: string;
  }[];

  orderType: "Dine In" | "Takeaway";

  table?: Types.ObjectId | null;

  discountPercentage?: number;

  paymentMethod: "Cash" | "Online";

  paymentStatus: "Pending" | "Paid";
}
