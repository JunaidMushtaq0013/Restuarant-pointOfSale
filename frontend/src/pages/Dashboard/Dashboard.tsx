import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../api/axious";
import { useAuth } from "../../context/AuthContext";

interface LiveOrder {
  _id: string;
  orderNumber: string;
  customerName?: string;
  orderType: "Dine In" | "Takeaway";
  grandTotal: number;
  status: "Pending" | "Preparing" | "Ready";
  createdAt: string;
}

interface TopSellingItem {
  _id: string;
  name: string;
  quantity: number;
  sales: number;
}

interface DashboardData {
  todaySales: number;
  todayOrders: number;
  averageOrderValue: number;

  salesTrend: {
    date: string;
    sales: number;
  }[];

  orders: {
    pending: number;
    preparing: number;
    ready: number;
    served: number;
    paid: number;
  };

  tables: {
    available: number;
    occupied: number;
  };

  lowStockItems: number;
  totalCustomers: number;

  liveOrders: LiveOrder[];
  topSellingItems: TopSellingItem[];
}

const Dashboard = () => {
  const { user } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * Only Manager and Cashier can see
   * sales/revenue-related information.
   */
  const canViewSales =
    user?.role === "Manager" || user?.role === "Cashier";

  useEffect(() => {
    const getDashboard = async () => {
      try {
        const response = await api.get("/dashboard");

        setData(response.data.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    getDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-500">
          Unable to load dashboard data.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Good morning 👋
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening at the restaurant today.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales
            Manager + Cashier ONLY
        */}
        {canViewSales && (
          <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm font-medium text-gray-500">
              Today's Sales
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              ₹{data.todaySales.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Total paid sales today
            </p>
          </div>
        )}

        {/* Today's Orders
            Everyone
        */}
        <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-gray-500">
            Today's Orders
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.todayOrders}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Orders created today
          </p>
        </div>

        {/* Customers
            Everyone
        */}
        <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-gray-500">
            Customers
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.totalCustomers}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Registered customers
          </p>
        </div>

        {/* Average Order Value
            Manager + Cashier ONLY
        */}
        {canViewSales && (
          <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm font-medium text-gray-500">
              Avg. Order Value
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              ₹{data.averageOrderValue.toFixed(2)}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Average value per order today
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          SALES + ORDER STATUS
      ====================================================== */}

      <div
        className={`grid grid-cols-1 gap-6 ${
          canViewSales ? "lg:grid-cols-3" : "lg:grid-cols-1"
        }`}
      >
        {/* ===================================================
            SALES CHART
            Manager + Cashier ONLY
        ==================================================== */}

        {canViewSales && (
          <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Sales This Week
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Paid sales over the last 7 days
              </p>
            </div>

            <div className="mt-4 h-64 sm:mt-6 sm:h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={data.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);

                      return date.toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                        },
                      );
                    }}
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) => [
                      `₹${Number(value).toFixed(2)}`,
                      "Sales",
                    ]}
                  />

                  <Bar
                    dataKey="sales"
                    name="Sales"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ===================================================
            ORDER STATUS
            Everyone
        ==================================================== */}

        <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Status
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current order activity
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Pending
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {data.orders.pending}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Preparing
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {data.orders.preparing}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Ready
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {data.orders.ready}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Served
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {data.orders.served}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Paid
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                {data.orders.paid}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          LIVE ORDERS + TOP SELLING
      ====================================================== */}

      <div
        className={`grid grid-cols-1 gap-6 ${
          canViewSales ? "lg:grid-cols-2" : "lg:grid-cols-1"
        }`}
      >
        {/* ===================================================
            LIVE ORDERS
            Everyone
        ==================================================== */}

        <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">
                Live Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Orders currently in progress
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {data.liveOrders.length} Active
            </span>
          </div>

          <div className="mt-5">
            {data.liveOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                No active orders.
              </div>
            ) : (
              <div className="space-y-3">
                {data.liveOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex min-w-0 flex-col gap-3 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {order.customerName ||
                          "Walk-in Customer"}{" "}
                        • {order.orderType}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{order.grandTotal.toFixed(2)}
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            TOP SELLING ITEMS
            Manager + Cashier ONLY
        ==================================================== */}

        {canViewSales && (
          <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Top Selling Items
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Best-selling items over the last 7 days
              </p>
            </div>

            <div className="mt-5">
              {data.topSellingItems.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                  No sales data available.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.topSellingItems.map(
                    (item, index) => (
                      <div
                        key={item._id}
                        className="flex min-w-0 items-center justify-between gap-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">
                              {item.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {item.quantity} sold
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 font-semibold text-gray-900">
                          ₹{item.sales.toFixed(2)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          OPERATIONS
          Everyone
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Available Tables */}
        <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">
            Available Tables
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.tables.available}
          </p>
        </div>

        {/* Occupied Tables */}
        <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">
            Occupied Tables
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.tables.occupied}
          </p>
        </div>

        {/* Low Stock */}
        <div className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">
            Low Stock Items
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.lowStockItems}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;