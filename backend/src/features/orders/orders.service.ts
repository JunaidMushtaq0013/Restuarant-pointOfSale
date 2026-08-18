import { Order } from "./orders.model.js";
import { CreateOrderPayload, OrderItemType } from "./orders.types.js";
import { Customer } from "../customer/customer.model.js";
import { Menu } from "../menu/menu.model.js";
import { PopulatedMenuType } from "../menu/menu.types.js";
import { Inventory } from "../inventory/inventory.model.js";
import mongoose from "mongoose";
import { Settings } from "../settings/settings.model.js";
import { Table } from "../tables/tables.model.js";

export const createOrderService = async (
  payload: CreateOrderPayload,
) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    let customer = null;

    // Find or create customer
    if (payload.customerPhone) {
      customer = await Customer.findOne({
        phone: payload.customerPhone,
      }).session(session);

      if (!customer) {
        const customers = await Customer.create(
          [
            {
              phone: payload.customerPhone,
              name: payload.customerName,
            },
          ],
          { session },
        );

        customer = customers[0];
      }
    }

    // Check table
    let table = null;

    if (payload.table) {
      table = await Table.findOne({
        _id: payload.table,
        isActive: true,
      }).session(session);

      if (!table) {
        throw new Error(
          "Table not found or inactive.",
        );
      }

      if (table.status === "Occupied") {
        throw new Error(
          "Table is already occupied.",
        );
      }
    }

    // Generate order number
    let orderNumber = "ORD-000001";

    const lastOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .session(session);

    if (lastOrder) {
      const lastOrderNumber = parseInt(
        lastOrder.orderNumber.replace("ORD-", ""),
      );

      const newOrderNumber =
        lastOrderNumber + 1;

      orderNumber = `ORD-${newOrderNumber
        .toString()
        .padStart(6, "0")}`;
    }

    // Prepare order items
    const orderItems: OrderItemType[] = [];

    let subTotal = 0;

    for (const item of payload.items) {
      const menuItem = (await Menu.findById(
        item.menu,
      )
        .populate("inventory")
        .session(session)) as PopulatedMenuType | null;

      if (!menuItem) {
        throw new Error(
          `Menu item with ID ${item.menu} not found.`,
        );
      }

      if (!menuItem.isActive) {
        throw new Error(
          `Menu item ${menuItem.name} is not active.`,
        );
      }

      if (!menuItem.inventory) {
        throw new Error(
          "Inventory not found.",
        );
      }

      if (
        menuItem.inventory.quantity <
        item.quantity
      ) {
        throw new Error(
          `Insufficient stock for menu item ${menuItem.name}. Available quantity: ${menuItem.inventory.quantity}`,
        );
      }

      // Reduce inventory
      await Inventory.findByIdAndUpdate(
        menuItem.inventory._id,
        {
          $inc: {
            quantity: -item.quantity,
          },
        },
        {
          session,
        },
      );

      const total =
        menuItem.sellingPrice * item.quantity;

      subTotal += total;

      orderItems.push({
        menu: menuItem._id,
        name: menuItem.name,
        price: menuItem.sellingPrice,
        quantity: item.quantity,
        total,
      });
    }

    // Discount
    const discountPercentage =
      payload.discountPercentage || 0;

    const discountAmount =
      (subTotal * discountPercentage) / 100;

    const totalAfterDiscount =
      subTotal - discountAmount;

    // Restaurant settings
    const settings =
      await Settings.findOne();

    if (!settings) {
      throw new Error(
        "Restaurant settings not found.",
      );
    }

    // GST
    const gstPercentage =
      settings.gstPercentage;

    const gstAmount =
      (totalAfterDiscount *
        gstPercentage) /
      100;

    // Service charge
    const serviceChargePercentage =
      settings.serviceChargePercentage;

    const serviceChargeAmount =
      (totalAfterDiscount *
        serviceChargePercentage) /
      100;

    // Grand total
    const grandTotal =
      totalAfterDiscount +
      gstAmount +
      serviceChargeAmount;

    // Create order
    const orders = await Order.create(
      [
        {
          orderNumber,

          customer: customer?._id,

          customerName:
            customer?.name,

          items: orderItems,

          orderType:
            payload.orderType,

          table:
            table?._id ?? null,

          subTotal,

          discountPercentage,

          discountAmount,

          gstPercentage,

          gstAmount,

          serviceChargePercentage,

          serviceChargeAmount,

          grandTotal,

          // NEW
          paymentStatus:
            payload.paymentStatus,
        },
      ],
      { session },
    );

    const order = orders[0];

    // Occupy table
    if (table) {
      table.status = "Occupied";

      await table.save({
        session,
      });
    }

    // Commit transaction
    await session.commitTransaction();

    // Return populated order
    return await Order.findById(
      order._id,
    )
      .populate(
        "customer",
        "name phone",
      )
      .populate(
        "items.menu",
        "name sellingPrice type",
      )
      .populate(
        "table",
        "tableNumber capacity status",
      );
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

export const getAllOrdersService = async (
  page = 1,
  limit = 10,
  status?: string,
) => {
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "name phone")
      .populate("items.menu", "name sellingPrice type")
      .populate(
        "table",
        "tableNumber capacity status",
      ),

    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalItems: totalOrders,
      limit,
    },
  };
};


export const getOrderByIdService = async (id: string) => {
  return await Order.findById(id)
    .populate("customer", "name phone")
    .populate("items.menu", "name sellingPrice type")
    .populate("table", "tableNumber capacity status");
};

export const updateOrderStatusService = async (
  id: string,
  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled",
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
  // Step 1: Find the order
  const order = await Order.findById(id).session(session);

  // Step 2: Check if order exists
  if (!order) {
    throw new Error("Order not found.");
  }

  // Step 3: Define allowed status transitions
  const allowedTransitions: Record<
    "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled",
    ("Pending" | "Preparing" | "Ready" | "Served" | "Cancelled")[]
  > = {
    Pending: ["Preparing", "Cancelled"],
    Preparing: ["Ready"],
    Ready: ["Served"],
    Served: [],
    Cancelled: [],
  };

  // Step 4: Get current order status
  const currentStatus = order.status as keyof typeof allowedTransitions;

  // Step 5: Get all valid next statuses
  const validStatuses = allowedTransitions[currentStatus];

  // Step 6: Validate transition
  if (!validStatuses.includes(status)) {
    throw new Error(`Cannot change status from ${currentStatus} to ${status}`);
  }

  // Step 7: Update status
  order.status = status;

  // Step 8: Save changes
  await order.save({ session });

  // A table is released when its dine-in order has been served, regardless of
  // whether the bill is paid now or settled afterwards.
  if (status === "Served" && order.table) {
    await Table.findByIdAndUpdate(
      order.table,
      { status: "Available" },
      { session, runValidators: true },
    );
  }

  await session.commitTransaction();

  // Step 9: Return updated order with details used by the Orders screen.
  return await Order.findById(order._id)
    .populate("customer", "name phone")
    .populate("items.menu", "name sellingPrice type")
    .populate("table", "tableNumber capacity status");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updatePaymentStatusService = async (
  id: string,
  paymentStatus: "Pending" | "Paid",
) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const order = await Order.findById(id).session(session);

    if (!order) {
      throw new Error("Order not found.");
    }

    // Update payment status
    order.paymentStatus = paymentStatus;

    await order.save({ session });

    // Payment alone does not free a dine-in table; it is released on Served.
    if (
      paymentStatus === "Paid" &&
      order.status === "Served" &&
      order.table
    ) {
      await Table.findByIdAndUpdate(
        order.table,
        {
          status: "Available",
        },
        {
          session,
          new: true,
          runValidators: true,
        },
      );
    }

    await session.commitTransaction();

    return await Order.findById(order._id)
      .populate("customer", "name phone")
      .populate("items.menu", "name sellingPrice type")
      .populate("table", "tableNumber capacity status");
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

export const cancelOrderService = async (id: string) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    const order = await Order.findById(id).session(session);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.status === "Cancelled") {
      throw new Error("Order is already cancelled.");
    }

    if (order.status === "Served") {
      throw new Error("Served orders cannot be cancelled.");
    }

    // Once kitchen work has started, ingredients may already have been used.
    // Restore stock only for orders that were never started.
    if (order.status === "Pending") {
      for (const item of order.items) {
        const menuItem = await Menu.findById(item.menu).session(session);

        if (!menuItem) {
          throw new Error("Menu item not found.");
        }

        await Inventory.findByIdAndUpdate(
          menuItem.inventory,
          {
            $inc: {
              quantity: item.quantity,
            },
          },
          {
            session,
          },
        );
      }
    }

    order.status = "Cancelled";

    // A paid cancelled order must not be counted as sales while its refund is
    // being processed. Keep the order for an auditable refund trail.
    if (order.paymentStatus === "Paid") {
      order.paymentStatus = "Refund Initiated";
    }

    await order.save({ session });

    if (order.table) {
      await Table.findByIdAndUpdate(
        order.table,
        { status: "Available" },
        { session, runValidators: true },
      );
    }

    await session.commitTransaction();
    return await Order.findById(order._id)
      .populate("customer", "name phone")
      .populate("items.menu", "name sellingPrice type")
      .populate("table", "tableNumber capacity status");
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};
