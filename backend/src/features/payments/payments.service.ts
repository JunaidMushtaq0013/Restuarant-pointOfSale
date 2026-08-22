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

  // 1. Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!,
    )
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new Error(
      "Invalid Razorpay payment signature.",
    );
  }

  // 2. Fetch the Razorpay order
  const razorpayOrder =
    await razorpay.orders.fetch(
      razorpayOrderId,
    );

  // 3. Get our POS order ID from Razorpay notes
  const orderId =
    razorpayOrder.notes?.orderId;

  if (!orderId) {
    throw new Error(
      "POS order ID not found in Razorpay order.",
    );
  }

  // 4. Find the POS order
  const order =
    await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found.");
  }

  // 5. Make sure this Razorpay order belongs
  //    to the POS order we found
  if (
    razorpayOrder.notes?.orderId !==
    order._id.toString()
  ) {
    throw new Error(
      "Razorpay order does not belong to this POS order.",
    );
  }

  // 6. Verify the amount
  const razorpayAmount =
    Number(razorpayOrder.amount);

  const expectedAmount =
    Math.round(order.grandTotal * 100);

  if (razorpayAmount !== expectedAmount) {
    throw new Error(
      "Razorpay payment amount does not match the order amount.",
    );
  }

  // 7. Prevent duplicate processing
  if (order.paymentStatus === "Paid") {
    return order;
  }

  // 8. Mark order as paid
  order.paymentStatus = "Paid";

  await order.save();

  return order;
};