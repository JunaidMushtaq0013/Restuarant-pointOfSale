import { useCallback, useEffect, useState } from "react";
import api from "../../api/axious";

interface InvoiceOrder {
  _id: string;
  orderNumber: string;

  customer?: {
    name: string;
    phone: string;
  };

  customerName?: string;

  items: {
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];

  subTotal: number;
  discountAmount: number;
  gstAmount: number;
  serviceChargeAmount: number;
  grandTotal: number;

  status:
    | "Pending"
    | "Preparing"
    | "Ready"
    | "Served"
    | "Cancelled";

  paymentStatus:
    | "Pending"
    | "Paid"
    | "Refund Initiated";

  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const Invoices = () => {
  const [orders, setOrders] = useState<InvoiceOrder[]>([]);

  const [fromDate, setFromDate] = useState(getToday());
  const [toDate, setToDate] = useState(getToday());

  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [loading, setLoading] = useState(false);

  const getInvoices = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const response = await api.get("/orders", {
          params: {
            page,
            limit: 10,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          },
        });

        setOrders(response.data.data);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Failed to load invoices:", error);
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate],
  );

  useEffect(() => {
    getInvoices(1);
  }, [getInvoices]);

  const handleApplyFilter = () => {
    getInvoices(1);
  };

 const exportInvoicesCsv = async () => {
  try {
    setLoading(true);

    const response = await api.get("/orders", {
      params: {
        page: 1,
        limit: 10000,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      },
    });

    const invoices: InvoiceOrder[] = response.data.data;

    if (invoices.length === 0) {
      alert("No invoices found for the selected dates.");
      return;
    }

    const headers = [
      "Invoice #",
      "Customer",
      "Phone",
      "Date & Time",
      "Subtotal",
      "Discount",
      "GST",
      "Service Charge",
      "Grand Total",
      "Order Status",
      "Payment Status",
    ];

    const rows = invoices.map((order) => [
      order.orderNumber,
      order.customer?.name ||
        order.customerName ||
        "Walk-in Customer",
      order.customer?.phone || "",
      formatDateTime(order.createdAt),
      order.subTotal.toFixed(2),
      order.discountAmount.toFixed(2),
      order.gstAmount.toFixed(2),
      order.serviceChargeAmount.toFixed(2),
      order.grandTotal.toFixed(2),
      order.status,
      order.paymentStatus,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `invoices-${fromDate}-to-${toDate}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export invoices:", error);
  } finally {
    setLoading(false);
  }
};

  // -------------------------
  // Download Invoice PDF
  // -------------------------

  const downloadInvoicePdf = async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `invoice-${orderId}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice:", error);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>

        <p className="mt-1 text-sm text-gray-500">
          View invoices for selected dates.
        </p>
      </div>

      {/* Date Filter */}

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* From Date */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          {/* To Date */}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          {/* Apply Filter */}

          <button
            type="button"
            onClick={handleApplyFilter}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Apply Filter
          </button>

          <button
            type="button"
            onClick={exportInvoicesCsv}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Invoice Table */}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-5 py-4 font-medium text-gray-600">
                  Invoice #
                </th>

                <th className="px-5 py-4 font-medium text-gray-600">
                  Customer
                </th>

                <th className="px-5 py-4 font-medium text-gray-600">
                  Date & Time
                </th>

                <th className="px-5 py-4 font-medium text-gray-600">
                  Subtotal
                </th>

                <th className="px-5 py-4 font-medium text-gray-600">Tax</th>

                <th className="px-5 py-4 font-medium text-gray-600">Total</th>

                <th className="px-5 py-4 font-medium text-gray-600">Payment</th>

                <th className="px-5 py-4 text-right font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Loading invoices...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    {/* Invoice Number */}

                    <td className="px-5 py-4 font-medium text-gray-900">
                      {order.orderNumber}
                    </td>

                    {/* Customer */}

                    <td className="px-5 py-4 text-gray-700">
                      <div>
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

                    {/* Date & Time */}

                    <td className="px-5 py-4 text-gray-600">
                      {formatDateTime(order.createdAt)}
                    </td>

                    {/* Subtotal */}

                    <td className="px-5 py-4 text-gray-600">
                      ₹{order.subTotal.toFixed(2)}
                    </td>

                    {/* Tax */}

                    <td className="px-5 py-4 text-gray-600">
                      ₹{order.gstAmount.toFixed(2)}
                    </td>

                    {/* Total */}

                    <td className="px-5 py-4 font-medium text-gray-900">
                      ₹{order.grandTotal.toFixed(2)}
                    </td>

                    {/* Payment */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "Refund Initiated"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => downloadInvoicePdf(order._id)}
                        className="whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No invoices found for the selected dates.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <div className="flex gap-2">
            {/* Previous */}

            <button
              type="button"
              disabled={pagination.currentPage === 1 || loading}
              onClick={() => getInvoices(pagination.currentPage - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {/* Next */}

            <button
              type="button"
              disabled={
                pagination.currentPage === pagination.totalPages || loading
              }
              onClick={() => getInvoices(pagination.currentPage + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
