import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import api from "../../api/axious";

interface DashboardData {
  todaySales: number;
  todayOrders: number;

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
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const orderData = [
    { name: "Pending", value: data.orders.pending },
    { name: "Preparing", value: data.orders.preparing },
    { name: "Ready", value: data.orders.ready },
    { name: "Served", value: data.orders.served },
    { name: "Paid", value: data.orders.paid },
  ];

  const tableData = [
    {
      name: "Available",
      value: data.tables.available,
    },
    {
      name: "Occupied",
      value: data.tables.occupied,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of today's restaurant operations
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Today's Sales
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹{data.todaySales.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Today's Orders
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.todayOrders}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Customers
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.totalCustomers}
          </p>
        </div>
      </div>

      {/* Sales Trend */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Sales Trend
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Paid sales over the last 7 days
        </p>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="sales"
                name="Sales"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Status */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Status
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current order distribution
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {orderData.map((_, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Occupancy */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Table Occupancy
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current restaurant table status
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tableData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {tableData.map((_, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Breakdown */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Breakdown
          </h2>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Orders"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operations */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Operations
          </h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-gray-600">
                Available Tables
              </span>

              <span className="text-xl font-semibold">
                {data.tables.available}
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-gray-600">
                Occupied Tables
              </span>

              <span className="text-xl font-semibold">
                {data.tables.occupied}
              </span>
            </div>

            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-gray-600">
                Low Stock Items
              </span>

              <span className="text-xl font-semibold">
                {data.lowStockItems}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                Total Customers
              </span>

              <span className="text-xl font-semibold">
                {data.totalCustomers}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;