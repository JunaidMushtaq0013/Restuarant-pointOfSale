import Razorpay from "razorpay";
import crypto from "crypto"
import { Order } from "../orders/orders.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createRazorpayOrderService = async (
  orderId: string,
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.paymentStatus === "Paid") {
    throw new Error("Order is already paid.");
  }

  if (order.grandTotal <= 0) {
    throw new Error("Order amount must be greater than zero.");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.grandTotal * 100),
    currency: "INR",
    receipt: order.orderNumber,
    notes: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    },
  });

  return {
    razorpayOrder,
    order,
  };
};

export const verifyRazorpayPaymentService = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) => {
  const body =
    razorpayOrderId + "|" + razorpayPaymentId;

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET!,
      )
      .update(body)
      .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error("Invalid Razorpay payment signature.");
  }

  const razorpayOrder =
    await razorpay.orders.fetch(
      razorpayOrderId,
    );

  const orderId =
    razorpayOrder.notes?.orderId;

  if (!orderId) {
    throw new Error(
      "POS order ID not found in Razorpay order.",
    );
  }

  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.paymentStatus === "Paid") {
    return order;
  }

  order.paymentStatus = "Paid";

  await order.save();

  return order;
};