interface Customer {
  _id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

interface CustomerOrder {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  paymentStatus: "Pending" | "Paid";
  status:
    | "Pending"
    | "Preparing"
    | "Ready"
    | "Served"
    | "Cancelled";
  orderType: "Dine In" | "Takeaway";
  createdAt: string;
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  customer: Customer | null;
  orders: CustomerOrder[];
  loading: boolean;
  onClose: () => void;
}

const CustomerDetailsModal = ({
  isOpen,
  customer,
  orders,
  loading,
  onClose,
}: CustomerDetailsModalProps) => {
  if (!isOpen || !customer) {
    return null;
  }

  const totalSpent = orders.reduce(
    (total, order) => total + order.grandTotal,
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Customer Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Customer information and order history
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 gap-4 border-b p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Name
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {customer.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Phone
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {customer.phone}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {orders.length}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Total Spent
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              ₹{totalSpent.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Last Order
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {orders.length > 0
                ? new Date(
                    orders[0].createdAt,
                  ).toLocaleDateString()
                : "No orders"}
            </p>
          </div>
        </div>

        {/* Orders */}
        <div className="px-6 pb-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Order History
          </h3>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
              This customer has no orders yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">
                        Order
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Date
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Type
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Total
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Payment
                      </th>

                      <th className="px-4 py-3 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {order.orderNumber}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {new Date(
                            order.createdAt,
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {order.orderType}
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          ₹{order.grandTotal.toFixed(2)}
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            {order.paymentStatus}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;