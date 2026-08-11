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



const averageOrderValue =
  todayOrders > 0 ? todaySales / todayOrders : 0;
      // --------------------------------
// LAST 7 DAYS SALES
// --------------------------------

const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
sevenDaysAgo.setHours(0, 0, 0, 0);

const salesTrend = await Order.aggregate([
  {
    $match: {
      createdAt: {
        $gte: sevenDaysAgo,
        $lte: endOfDay,
      },
      paymentStatus: "Paid",
    },
  },
  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$createdAt",
        },
      },
      sales: {
        $sum: "$grandTotal",
      },
    },
  },
  {
    $sort: {
      _id: 1,
    },
  },
]);


// --------------------------------
// TOP SELLING ITEMS - LAST 7 DAYS
// --------------------------------

const topSellingItems = await Order.aggregate([
  {
    $match: {
      createdAt: {
        $gte: sevenDaysAgo,
        $lte: endOfDay,
      },
      paymentStatus: "Paid",
    },
  },

  {
    $unwind: "$items",
  },

  {
    $group: {
      _id: "$items.menu",

      name: {
        $first: "$items.name",
      },

      quantity: {
        $sum: "$items.quantity",
      },

      sales: {
        $sum: "$items.total",
      },
    },
  },

  {
    $sort: {
      quantity: -1,
    },
  },

  {
    $limit: 5,
  },
]);



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
// LIVE ORDERS
// --------------------------------

const liveOrders = await Order.find({
  status: {
    $in: ["Pending", "Preparing", "Ready"],
  },
})
  .sort({ createdAt: -1 })
  .limit(5)
  .select(
    "orderNumber customerName grandTotal status orderType createdAt"
  );

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

 const formattedSalesTrend = [];

for (let i = 0; i < 7; i++) {
  const date = new Date(sevenDaysAgo);

  date.setDate(sevenDaysAgo.getDate() + i);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const dateString = `${year}-${month}-${day}`;

  const daySales = salesTrend.find(
    (item) => item._id === dateString
  );

  formattedSalesTrend.push({
    date: dateString,
    sales: daySales?.sales || 0,
  });
}

  // --------------------------------
  // RETURN DASHBOARD
  // --------------------------------

return {
  todaySales,
  todayOrders,
   averageOrderValue,
  salesTrend: formattedSalesTrend,

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

  liveOrders,

  topSellingItems,
};
};