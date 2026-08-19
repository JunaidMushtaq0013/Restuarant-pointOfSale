import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axious";

type KitchenStatus = "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";

interface KitchenOrderItem {
  _id?: string;
  name: string;
  quantity: number;
}

interface KitchenOrder {
  _id: string;
  orderNumber: string;
  customerName?: string;
  items: KitchenOrderItem[];
  orderType: "Dine In" | "Takeaway";
  status: KitchenStatus;
  createdAt: string;
}

const activeKitchenStatuses: KitchenStatus[] = ["Pending", "Preparing"];

const Kitchen = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const getKitchenOrders = async () => {
      try {
        const response = await api.get("/orders");
        const kitchenOrders = (response.data.data as KitchenOrder[]).filter(
          (order) => activeKitchenStatuses.includes(order.status),
        );

        setOrders(kitchenOrders);
      } catch (error) {
        console.error("Failed to load kitchen orders:", error);
        toast.error("Failed to load kitchen orders.");
      } finally {
        setLoading(false);
      }
    };

    getKitchenOrders();
  }, []);

  const updateStatus = async (order: KitchenOrder) => {
    const nextStatus = order.status === "Pending" ? "Preparing" : "Ready";

    try {
      setUpdatingOrderId(order._id);

      const response = await api.patch(`/orders/${order._id}/status`, {
        status: nextStatus,
      });
      const updatedOrder = response.data.data as KitchenOrder;

      setOrders((currentOrders) =>
        nextStatus === "Ready"
          ? currentOrders.filter((currentOrder) => currentOrder._id !== order._id)
          : currentOrders.map((currentOrder) =>
              currentOrder._id === order._id ? updatedOrder : currentOrder,
            ),
      );
      toast.success(`Order ${order.orderNumber} marked ${nextStatus}.`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading kitchen orders...</p>;
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kitchen</h1>
        <p className="mt-1 text-sm text-gray-500">Pending and preparing orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500">
          No orders are waiting in the kitchen.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const isPending = order.status === "Pending";
            const actionLabel = isPending ? "Start Preparing" : "Mark Ready";

            return (
              <article key={order._id} className="border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {order.customerName || "Walk-in customer"} · {order.orderType}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 text-xs font-medium ${
                      isPending
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <ul className="my-4 space-y-2 text-sm text-gray-700">
                  {order.items.map((item, index) => (
                    <li key={`${item._id ?? item.name}-${index}`} className="flex justify-between gap-4">
                      <span>{item.name}</span>
                      <span className="font-medium">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => updateStatus(order)}
                  disabled={updatingOrderId === order._id}
                  className="btn-primary w-full"
                >
                  {updatingOrderId === order._id ? "Updating..." : actionLabel}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Kitchen;
