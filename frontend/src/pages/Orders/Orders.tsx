import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axious";
import { useAuth } from "../../context/AuthContext";
import ViewOrderModal from "../../components/order/veiwOrderModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import ActionIcon from "../../components/common/ActionIcon";
import { socket } from "../../socket";
import type { AxiosError } from "axios";

export interface Order {
  _id: string;
  orderNumber: string;

  customer?: {
    _id: string;
    name: string;
    phone: string;
  };

  customerName?: string;

  items: {
    menu: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];

  orderType: "Dine In" | "Takeaway";

  table?: {
    _id: string;
    tableNumber: string;
    capacity: number;
    status: string;
  } | null;

  subTotal: number;
  discountPercentage: number;
  discountAmount: number;

  gstPercentage: number;
  gstAmount: number;

  serviceChargePercentage: number;
  serviceChargeAmount: number;

  grandTotal: number;

  paymentStatus: "Pending" | "Paid" | "Refund Initiated";

  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSettings {
  restaurantName: string;
  restaurantAddress: string;
  phone: string;
  email: string;
  gstNumber: string;
  invoiceFooter: string;
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayPaymentFailedResponse {
  error?: {
    description?: string;
  };
}

interface ApiErrorResponse {
  message?: string;
}

type OrderStatus =
  | ""
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Served"
  | "Cancelled";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

const Orders = () => {
  const { user } = useAuth();

  // =========================
  // Orders
  // =========================

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  // =========================
  // Search
  // =========================

  const [search, setSearch] = useState("");

  // =========================
  // Status Filter
  // =========================

  const [statusFilter, setStatusFilter] = useState<OrderStatus>("");

  // =========================
  // Pagination
  // =========================

  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // =========================
  // View Order Modal
  // =========================

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // =========================
  // Payment
  // =========================

  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  // =========================
  // Served
  // =========================

  const [servingOrderId, setServingOrderId] = useState<string | null>(null);

  // =========================
  // Cancel
  // =========================

  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const [cancellingOrder, setCancellingOrder] = useState(false);

  // =========================
  // Invoice Settings
  // =========================

  const [invoiceSettings, setInvoiceSettings] =
    useState<InvoiceSettings | null>(null);

  // =========================
  // Get Orders
  // =========================

  const getOrders = useCallback(
    async (
      page: number = 1,
      status: OrderStatus = "",
      isTableUpdate = false,
    ) => {
      try {
        if (isTableUpdate) {
          setTableLoading(true);
        } else {
          setLoading(true);
        }

        const response = await api.get("/orders", {
          params: {
            page,
            limit: 10,
            status: status || undefined,
          },
        });

        setOrders(response.data.data);

        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Failed to load orders:", error);

        toast.error("Failed to load orders.");
      } finally {
        if (isTableUpdate) {
          setTableLoading(false);
        } else {
          setLoading(false);
        }
      }
    },
    [],
  );

  // =========================
  // Initial Load
  // =========================

  useEffect(() => {
    const loadOrders = async () => {
      await getOrders(1, "");
    };

    void loadOrders();
  }, [getOrders]);

  // =========================
  // Real-Time Order Updates
  // =========================

  useEffect(() => {
    const handleNewOrder = (newOrder: Order) => {
      console.log("🍽️ New order received:", newOrder.orderNumber);

      setOrders((currentOrders) => {
        const alreadyExists = currentOrders.some(
          (order) => order._id === newOrder._id,
        );

        if (alreadyExists) {
          return currentOrders;
        }

        return [newOrder, ...currentOrders];
      });

      setPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems + 1,
      }));
    };

    const handleOrderStatusUpdated = (updatedOrder: Order) => {
      console.log(
        "🔄 Order status updated:",
        updatedOrder.orderNumber,
        updatedOrder.status,
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        ),
      );

      setSelectedOrder((currentOrder) =>
        currentOrder?._id === updatedOrder._id ? updatedOrder : currentOrder,
      );
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("orderStatusUpdated", handleOrderStatusUpdated);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("orderStatusUpdated", handleOrderStatusUpdated);
    };
  }, []);

  // =========================
  // Search
  // =========================

  const handleSearch = () => {
    // Search is currently frontend-side
    // for the orders loaded from the API.
    //
    // Status filtering is backend-side.
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  // =========================
  // Status Filter
  // =========================

  const handleStatusFilter = (status: OrderStatus) => {
    setStatusFilter(status);

    // Always start from page 1
    // when changing the filter.
    getOrders(1, status, true);
  };

  // =========================
  // Pagination
  // =========================

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) {
      return;
    }

    getOrders(newPage, statusFilter, true);
  };

  // =========================
  // Search Current Page
  // =========================

  const filteredOrders = orders.filter((order) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      order.orderNumber?.toLowerCase().includes(searchValue) ||
      order.customer?.name?.toLowerCase().includes(searchValue) ||
      order.customer?.phone?.includes(searchValue) ||
      order.customerName?.toLowerCase().includes(searchValue)
    );
  });

  // =========================
  // View Order
  // =========================

  const viewOrder = async (id: string) => {
    try {
      const response = await api.get(`/orders/${id}`);

      setSelectedOrder(response.data.data);

      setIsViewModalOpen(true);

      try {
        const settingsResponse = await api.get("/settings");

        setInvoiceSettings(settingsResponse.data.data);
      } catch (settingsError) {
        console.error("Failed to load invoice settings:", settingsError);
      }
    } catch (error) {
      console.error("Failed to load order:", error);

      toast.error("Failed to load order details.");
    }
  };

  // =========================
  // Cancel Order
  // =========================

  const cancelOrder = async () => {
    if (!orderToCancel) {
      return;
    }

    try {
      setCancellingOrder(true);

      const response = await api.patch(`/orders/${orderToCancel._id}/cancel`);

      const updatedOrder = response.data.data as Order;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        ),
      );

      setSelectedOrder(updatedOrder);

      setOrderToCancel(null);

      toast.success(
        updatedOrder.paymentStatus === "Refund Initiated"
          ? "Order cancelled. Refund initiated and removed from sales."
          : "Order cancelled.",
      );
    } catch (error) {
      console.error("Failed to cancel order:", error);

      toast.error("Failed to cancel order.");
    } finally {
      setCancellingOrder(false);
    }
  };

  // =========================
  // Mark As Paid
  // =========================

  const markAsPaid = async (id: string, discountPercentage: number) => {
    try {
      setPaymentLoading(id);

      const response = await api.patch(`/orders/${id}/payment-status`, {
        paymentStatus: "Paid",
        discountPercentage,
      });

      const updatedOrder = response.data.data as Order;

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === id ? updatedOrder : order)),
      );

      setSelectedOrder(updatedOrder);

      toast.success("Order marked as paid.");
    } catch (error) {
      console.error("Failed to update payment:", error);

      toast.error("Failed to mark order as paid.");
    } finally {
      setPaymentLoading(null);
    }
  };

  ///razorpay \

  const handleOnlinePayment = async (
    orderId: string,
    discountPercentage: number,
  ) => {
    try {
      const response = await api.post("/payments/razorpay/create-order", {
        orderId,
        discountPercentage,
      });

      const { razorpayOrder } = response.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Warisoft POS",
        description: `Payment for ${razorpayOrder.receipt}`,
        order_id: razorpayOrder.id,

        handler: async function (response: RazorpayPaymentResponse) {
          try {
            console.log("Razorpay payment response:", response);

            const verifyResponse = await api.post("/payments/razorpay/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            const updatedOrder = verifyResponse.data.data;

            setSelectedOrder(updatedOrder);

            await getOrders();

            toast.success("Payment successful and verified.");
          } catch (error) {
            console.error("Payment verification failed:", error);

            toast.error("Payment verification failed.");
          }
        },

        theme: {
          color: "#111827",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response: RazorpayPaymentFailedResponse) => {
          console.error("Razorpay payment failed:", response);

          toast.error(
            response.error?.description ||
              "Payment failed. The order remains pending.",
          );
        },
      );

      razorpay.on("modal.closed", () => {
        toast.info("Payment cancelled. The order remains pending.");
      });

      razorpay.open();
    } catch (error) {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  toast.error(
    axiosError.response?.data?.message ||
      "Unable to initiate online payment.",
  );
}
  };
  // =========================
  // Mark As Served
  // =========================

  const markAsServed = async (id: string) => {
    try {
      setServingOrderId(id);

      const response = await api.patch(`/orders/${id}/status`, {
        status: "Served",
      });

      const updatedOrder = response.data.data as Order;

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === id ? updatedOrder : order)),
      );

      setSelectedOrder(updatedOrder);

      toast.success("Order marked as served. The table is now available.");
    } catch (error) {
      console.error("Failed to mark order as served:", error);

      toast.error("Failed to mark order as served.");
    } finally {
      setServingOrderId(null);
    }
  };

  // =========================
  // Status Classes
  // =========================

  const getStatusClass = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Preparing":
        return "bg-blue-100 text-blue-700";

      case "Ready":
        return "bg-green-100 text-green-700";

      case "Served":
        return "bg-purple-100 text-purple-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <p className="text-sm text-gray-500">Loading orders...</p>
      </div>
    );
  }

  // =========================
  // RETURN
  // =========================

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage restaurant orders
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Total Orders:{" "}
          <span className="font-semibold text-gray-900">
            {pagination.totalItems}
          </span>
        </div>
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search by order number, customer, phone..."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
          >
            Search
          </button>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* =========================
          STATUS FILTER
      ========================= */}

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
          {["", "Pending", "Preparing", "Ready", "Served", "Cancelled"].map(
            (status) => (
              <button
                key={status || "All"}
                type="button"
                onClick={() => handleStatusFilter(status as OrderStatus)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  statusFilter === status
                    ? "bg-[#221b18] text-[#f0d9b6]"
                    : "bg-[#f5ede3] text-[#4a3f38] hover:bg-[#ede2d8]"
                }`}
              >
                {status || "All"}
              </button>
            ),
          )}
          {tableLoading && (
            <span className="flex items-center px-2 text-xs text-gray-500">
              Updating orders...
            </span>
          )}
        </div>
      </div>

      {/* =========================
          DESKTOP TABLE
      ========================= */}

      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-600">Order #</th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Customer
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">Type</th>

                <th className="px-6 py-4 font-medium text-gray-600">Table</th>

                <th className="px-6 py-4 font-medium text-gray-600">Status</th>

                <th className="px-6 py-4 font-medium text-gray-600">Payment</th>

                <th className="px-6 py-4 text-right font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    {/* Order Number */}

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.orderNumber}
                    </td>

                    {/* Customer */}

                    <td className="px-6 py-4 text-gray-700">
                      <div className="max-w-[180px] truncate">
                        {order.customer?.name ||
                          order.customerName ||
                          "Walk-in Customer"}
                      </div>

                      {order.customer?.phone && (
                        <div className="mt-1 text-xs text-gray-400">
                          {order.customer.phone}
                        </div>
                      )}
                    </td>

                    {/* Type */}

                    <td className="px-6 py-4 text-gray-600">
                      {order.orderType}
                    </td>

                    {/* Table */}

                    <td className="px-6 py-4 text-gray-600">
                      {order.table?.tableNumber || "—"}
                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Payment */}

                    <td className="px-6 py-4">
                      {order.paymentStatus === "Paid" ? (
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Paid
                        </span>
                      ) : order.paymentStatus === "Refund Initiated" ? (
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Refund Initiated
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Action */}

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => viewOrder(order._id)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <ActionIcon label="View" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          MOBILE CARDS
      ========================= */}

      <div className="space-y-4 md:hidden">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {/* Header */}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Order</p>

                  <h2 className="truncate text-base font-bold text-gray-900">
                    {order.orderNumber}
                  </h2>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Customer */}

              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Customer</p>

                <p className="mt-1 font-medium text-gray-900">
                  {order.customer?.name ||
                    order.customerName ||
                    "Walk-in Customer"}
                </p>

                {order.customer?.phone && (
                  <p className="mt-1 text-xs text-gray-500">
                    {order.customer.phone}
                  </p>
                )}
              </div>

              {/* Details */}

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Order Type</p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {order.orderType}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Table</p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {order.table?.tableNumber || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Items</p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {order.items.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Payment</p>

                  {order.paymentStatus === "Paid" ? (
                    <span className="mt-1 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      Paid
                    </span>
                  ) : order.paymentStatus === "Refund Initiated" ? (
                    <span className="mt-1 inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                      Refund
                    </span>
                  ) : (
                    <span className="mt-1 inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* View */}

              <button
                type="button"
                onClick={() => viewOrder(order._id)}
                className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ActionIcon label="View" />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm">
            No orders found.
          </div>
        )}
      </div>

      {/* =========================
          PAGINATION
      ========================= */}

      {pagination.totalItems > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-gray-500 sm:text-left">
              Page{" "}
              <span className="font-medium text-gray-700">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-700">
                {pagination.totalPages}
              </span>{" "}
              (
              <span className="font-medium text-gray-700">
                {pagination.totalItems}
              </span>{" "}
              orders)
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                Previous
              </button>

              <span className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white">
                {pagination.currentPage}
              </span>

              <button
                type="button"
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          VIEW ORDER MODAL
      ========================= */}

      {isViewModalOpen && selectedOrder && (
        <ViewOrderModal
          order={selectedOrder}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedOrder(null);
          }}
          onMarkAsPaid={markAsPaid}
          onOnlinePayment={handleOnlinePayment}
          onMarkAsServed={markAsServed}
          onCancelOrder={(order) => setOrderToCancel(order)}
          canCancelOrder={user?.role === "Manager" || user?.role === "Cashier"}
          canProcessPayment={
            user?.role === "Manager" || user?.role === "Cashier"
          }
          canMarkAsServed={
            user?.role === "Manager" ||
            user?.role === "Cashier" ||
            user?.role === "Waiter"
          }
          paymentLoading={paymentLoading === selectedOrder._id}
          servingLoading={servingOrderId === selectedOrder._id}
          invoiceSettings={invoiceSettings}
        />
      )}

      {/* =========================
          CONFIRM CANCEL MODAL
      ========================= */}

      <ConfirmModal
        isOpen={orderToCancel !== null}
        title="Cancel Order"
        message={
          orderToCancel?.paymentStatus === "Paid"
            ? `Cancel ${
                orderToCancel.orderNumber
              }? Its payment will change to Refund Initiated and it will be removed from sales.${
                orderToCancel.status === "Pending"
                  ? " Stock will also be restored."
                  : ""
              }`
            : `Cancel ${orderToCancel?.orderNumber ?? "this order"}?${
                orderToCancel?.status === "Pending"
                  ? " Stock will be restored."
                  : ""
              } Its table will be released.`
        }
        confirmText="Cancel Order"
        cancelText="Keep Order"
        loading={cancellingOrder}
        onCancel={() => setOrderToCancel(null)}
        onConfirm={cancelOrder}
      />
    </div>
  );
};

export default Orders;
