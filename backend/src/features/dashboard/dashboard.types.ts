export interface DashboardData {
  todaySales: number;
  todayOrders: number;

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