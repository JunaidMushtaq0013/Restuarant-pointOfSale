import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axious";
import { useAuth } from "../../context/AuthContext";
import ViewOrderModal from "../../components/order/veiwOrderModal";
import ConfirmModal from "../../components/common/ConfirmModal";

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

  status:
    | "Pending"
    | "Preparing"
    | "Ready"
    | "Served"
    | "Cancelled";

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

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState<string | null>(null);
  const [servingOrderId, setServingOrderId] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings | null>(null);

  const getOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders");

      setOrders(response.data.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const viewOrder = async (id: string) => {
    try {
      const response = await api.get(`/orders/${id}`);

      setSelectedOrder(response.data.data);
      setIsViewModalOpen(true);

      api
        .get("/settings")
        .then((settingsResponse) => setInvoiceSettings(settingsResponse.data.data))
        .catch((settingsError) =>
          console.error("Failed to load invoice settings:", settingsError),
        );
    } catch (error) {
      console.error("Failed to load order:", error);
      toast.error("Failed to load order details.");
    }
  };

  const cancelOrder = async () => {
    if (!orderToCancel) return;

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

  const markAsPaid = async (id: string) => {
    try {
      setPaymentLoading(id);

      const response = await api.patch(
        `/orders/${id}/payment-status`,
        {
          paymentStatus: "Paid",
        },
      );

      const updatedOrder = response.data.data;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === id ? updatedOrder : order,
        ),
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

  const markAsServed = async (id: string) => {
    try {
      setServingOrderId(id);
      const response = await api.patch(`/orders/${id}/status`, {
        status: "Served",
      });
      const updatedOrder = response.data.data as Order;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === id ? updatedOrder : order,
        ),
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

  const filteredOrders = orders.filter((order) => {
    const searchValue = search.toLowerCase();

    return (
      order.orderNumber
        .toLowerCase()
        .includes(searchValue) ||
      order.customerName
        ?.toLowerCase()
        .includes(searchValue) ||
      order.customer?.name
        .toLowerCase()
        .includes(searchValue) ||
      order.customer?.phone.includes(searchValue) ||
      order.status
        .toLowerCase()
        .includes(searchValue) ||
      order.paymentStatus
        .toLowerCase()
        .includes(searchValue)
    );
  });

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Orders
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage restaurant orders
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by order number, customer, phone, status..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="border-b bg-gray-50">
              <tr>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Order #
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Customer
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Type
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Table
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Total
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Status
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Payment
                </th>

                <th className="px-6 py-4 font-medium text-gray-600">
                  Date
                </th>

                <th className="px-6 py-4 text-right font-medium text-gray-600">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody className="divide-y">

              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.orderNumber}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {order.customer?.name ||
                        order.customerName ||
                        "Walk-in Customer"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {order.orderType}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {order.table?.tableNumber || "—"}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{order.grandTotal.toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">

                      {order.paymentStatus === "Paid" ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Paid
                        </span>
                      ) : order.paymentStatus === "Refund Initiated" ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Refund Initiated
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Pending
                        </span>
                      )}

                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            viewOrder(order._id)
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
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

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <ViewOrderModal
          order={selectedOrder}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedOrder(null);
          }}
          onMarkAsPaid={markAsPaid}
          onMarkAsServed={markAsServed}
          onCancelOrder={(order) => setOrderToCancel(order)}
          canCancelOrder={user?.role === "Manager" || user?.role === "Cashier"}
          canMarkAsServed={
            user?.role === "Manager" ||
            user?.role === "Cashier" ||
            user?.role === "Waiter"
          }
          paymentLoading={
            paymentLoading === selectedOrder._id
          }
          servingLoading={servingOrderId === selectedOrder._id}
          invoiceSettings={invoiceSettings}
        />
      )}

      <ConfirmModal
        isOpen={orderToCancel !== null}
        title="Cancel Order"
        message={
          orderToCancel?.paymentStatus === "Paid"
          ? `Cancel ${orderToCancel.orderNumber}? Its payment will change to Refund Initiated and it will be removed from sales.${orderToCancel.status === "Pending" ? " Stock will also be restored." : ""}`
          : `Cancel ${orderToCancel?.orderNumber ?? "this order"}?${orderToCancel?.status === "Pending" ? " Stock will be restored." : ""} Its table will be released.`
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
