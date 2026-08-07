import { Order } from "./orders.model.js";
import { CreateOrderPayload, OrderItemType } from "./orders.types.js";
import { Customer } from "../customer/customer.model.js";
import { Menu } from "../menu/menu.model.js";
import { PopulatedMenuType } from "../menu/menu.types.js";
import { Inventory } from "../inventory/inventory.model.js";
import mongoose from "mongoose";
import { Settings } from "../settings/settings.model.js";

export const createOrderService = async (payload: CreateOrderPayload) => {
  const session = await mongoose.startSession();

  session.startTransaction();
  try {
    let customer = null;

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
    //here i am staring with custom order number ORD-000001 and then checking if there is any order in the database and if there is then i am getting the last order number and incrementing it by 1 and then creating a new order number with the incremented value and then using that order number for the new order
    let orderNumber = "ORD-000001";

    const lastOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .session(session);

    if (lastOrder) {
      const lastOrderNumber = parseInt(
        lastOrder.orderNumber.replace("ORD-", ""),
      );
      const newOrderNumber = lastOrderNumber + 1;
      orderNumber = `ORD-${newOrderNumber.toString().padStart(6, "0")}`;
    }
    const orderItems: OrderItemType[] = [];
    let subTotal = 0;
    for (const item of payload.items) {
      //here we are checking if the menu item is active and if the inventory is available for the menu item and also checking if the quantity is available in the inventory or not but after even .populate inventory in the menu item below when i did menuitem.inventory.quantity it was giving me undefined so i had to create a new interface in the menu.types.ts file called PopulatedMenuType which extends the MenuType and replaces the inventory field with the InventoryType and then i used that interface to typecast the menuItem variable below and then it worked fine and now i can access the inventory quantity of the menu item and check if it is available or not and also reduce the quantity in the inventory after the order is created successfully
      const menuItem = (await Menu.findById(item.menu)
        .populate("inventory")
        .session(session)) as PopulatedMenuType | null;
      if (!menuItem) {
        throw new Error(`Menu item with ID ${item.menu} not found.`);
      }
      if (!menuItem.isActive) {
        throw new Error(`Menu item ${menuItem.name} is not active.`);
      }
      if (!menuItem.inventory) {
        throw new Error("Inventory not found.");
      }
      if (menuItem.inventory.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for menu item ${menuItem.name}. Available quantity: ${menuItem.inventory.quantity}`,
        );
      }
      //for reducing stock quantity in inventory after checks and all this is something new that i learned before this i was doing menuitem.inventory.quantity and then .save() but that was not efficient .

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
      const total = menuItem.sellingPrice * item.quantity;

      subTotal += total;

      orderItems.push({
        menu: menuItem._id,
        name: menuItem.name,
        price: menuItem.sellingPrice,
        quantity: item.quantity,
        total,
      });
    }

    const discountPercentage = payload.discountPercentage || 0;

    const discountAmount = (subTotal * discountPercentage) / 100;

    const totalAfterDiscount = subTotal - discountAmount;

    //later we will read it from settings

    const settings = await Settings.findOne();

    if (!settings) {
      throw new Error("Restaurant settings not found.");
    }

    //now imported from settings
    const gstPercentage = settings.gstPercentage;

    const gstAmount = (totalAfterDiscount * gstPercentage) / 100;

    //again later settings
    const serviceChargePercentage = settings.serviceChargePercentage;

    const serviceChargeAmount =
      (totalAfterDiscount * serviceChargePercentage) / 100;

    const grandTotal = totalAfterDiscount + gstAmount + serviceChargeAmount;

    const orders = await Order.create(
      [
        {
          orderNumber,
          customer: customer?._id,
          customerName: customer?.name,

          items: orderItems,

          orderType: payload.orderType,

          subTotal,

          discountPercentage,
          discountAmount,

          gstPercentage,
          gstAmount,

          serviceChargePercentage,
          serviceChargeAmount,

          grandTotal,
        },
      ],
      { session },
    );

    const order = orders[0];

    await session.commitTransaction();

    return await Order.findById(order._id)
      .populate("customer", "name phone")
      .populate("items.menu", "name sellingPrice type");
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};

export const getAllOrdersService = async () => {
  return await Order.find()
    .sort({ createdAt: -1 })
    .populate("customer", "name phone")
    .populate("items.menu", "name sellingPrice type");
};

export const getOrderByIdService = async (id: string) => {
  return await Order.findById(id)
    .populate("customer", "name phone")
    .populate("items.menu", "name sellingPrice type");
};

export const updateOrderStatusService = async (
  id: string,
  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled",
) => {
  // Step 1: Find the order
  const order = await Order.findById(id);

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
  await order.save();

  // Step 9: Return updated order
  return order;
};

export const updatePaymentStatusService = async (
  id: string,
  paymentStatus: "Pending" | "Paid",
) => {
  return await Order.findByIdAndUpdate(
    id,
    { paymentStatus },
    {
      new: true,
      runValidators: true,
    },
  );
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

    if (order.status !== "Pending") {
      throw new Error("Only pending orders can be cancelled.");
    }

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

    order.status = "Cancelled";

    await order.save({ session });
    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};
