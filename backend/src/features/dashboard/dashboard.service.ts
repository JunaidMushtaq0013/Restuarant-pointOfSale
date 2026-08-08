import { Order } from "../orders/orders.model.js";
import { Table } from "../tables/tables.model.js";
import { Inventory } from "../inventory/inventory.model.js";
import { Customer } from "../customer/customer.model.js";

export const getDashboardService = async () => {
  // --------------------------------
  // TODAY'S DATE RANGE
  // --------------------------------

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // --------------------------------
  // TODAY'S ORDERS
  // --------------------------------

  const todayOrders = await Order.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  // --------------------------------
  // TODAY'S SALES
  // --------------------------------

  const todaySalesResult = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        paymentStatus: "Paid",
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$grandTotal",
        },
      },
    },
  ]);

  const todaySales =
    todaySalesResult.length > 0
      ? todaySalesResult[0].total
      : 0;

  // --------------------------------
  // ORDER STATUS COUNTS
  // --------------------------------

  const [
    pendingOrders,
    preparingOrders,
    readyOrders,
    servedOrders,
    paidOrders,
  ] = await Promise.all([
    Order.countDocuments({
      status: "Pending",
    }),

    Order.countDocuments({
      status: "Preparing",
    }),

    Order.countDocuments({
      status: "Ready",
    }),

    Order.countDocuments({
      status: "Served",
    }),

    Order.countDocuments({
      paymentStatus: "Paid",
    }),
  ]);

  // --------------------------------
  // TABLE COUNTS
  // --------------------------------

  const [availableTables, occupiedTables] =
    await Promise.all([
      Table.countDocuments({
        status: "Available",
        isActive: true,
      }),

      Table.countDocuments({
        status: "Occupied",
        isActive: true,
      }),
    ]);

  // --------------------------------
  // LOW STOCK
  // --------------------------------

  const lowStockItems = await Inventory.countDocuments({
    isActive: true,
    $expr: {
      $lte: ["$quantity", "$minimumStock"],
    },
  });

  // --------------------------------
  // TOTAL CUSTOMERS
  // --------------------------------

  const totalCustomers = await Customer.countDocuments();

  // --------------------------------
  // RETURN DASHBOARD
  // --------------------------------

  return {
    todaySales,
    todayOrders,

    orders: {
      pending: pendingOrders,
      preparing: preparingOrders,
      ready: readyOrders,
      served: servedOrders,
      paid: paidOrders,
    },

    tables: {
      available: availableTables,
      occupied: occupiedTables,
    },

    lowStockItems,

    totalCustomers,
  };
};