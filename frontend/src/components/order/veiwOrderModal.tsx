import type { InvoiceSettings, Order } from "../../pages/Orders/Orders";

interface ViewOrderModalProps {
  order: Order;
  onClose: () => void;
  onMarkAsPaid: (id: string) => void;
  onOnlinePayment: (id: string) => void;
  onMarkAsServed: (id: string) => void;
  onCancelOrder: (order: Order) => void;
  canCancelOrder: boolean;
  canMarkAsServed: boolean;
  paymentLoading: boolean;
  servingLoading: boolean;
  invoiceSettings: InvoiceSettings | null;
}

const ViewOrderModal = ({
  order,
  onClose,
  onMarkAsPaid,
  onOnlinePayment,
  onMarkAsServed,
  onCancelOrder,
  canCancelOrder,
  canMarkAsServed,
  paymentLoading,
  servingLoading,
  invoiceSettings,
}: ViewOrderModalProps) => {
  const printInvoice = () => {
    const escapeHtml = (value: string | number) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    const currency = "₹";
    const businessName = invoiceSettings?.restaurantName || "Restaurant";
    const businessDetails = [
      invoiceSettings?.restaurantAddress,
      invoiceSettings?.phone,
      invoiceSettings?.email,
      invoiceSettings?.gstNumber && `GSTIN: ${invoiceSettings.gstNumber}`,
    ].filter(Boolean);
    const invoiceWindow = window.open("", "_blank", "width=800,height=900");

    if (!invoiceWindow) return;

    const items = order.items
      .map(
        (item) =>
          `<tr><td>${escapeHtml(item.name)}</td><td class="center">${item.quantity}</td><td class="right">${currency}${item.price.toFixed(2)}</td><td class="right">${currency}${item.total.toFixed(2)}</td></tr>`,
      )
      .join("");

    invoiceWindow.document.write(
      `<!doctype html><html><head><title>Invoice ${escapeHtml(order.orderNumber)}</title><style>body{font-family:Arial,sans-serif;color:#111;margin:40px;max-width:720px}header{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:18px;margin-bottom:24px}h1,h2,p{margin:0}h1{font-size:24px}h2{font-size:18px;margin-bottom:6px}.muted{color:#555;font-size:13px}.details{display:flex;justify-content:space-between;margin-bottom:24px;gap:24px}.details div{min-width:0}table{width:100%;border-collapse:collapse}th,td{padding:10px 6px;border-bottom:1px solid #ddd;text-align:left}.right{text-align:right}.center{text-align:center}.totals{margin:20px 0 0 auto;width:290px}.totals div{display:flex;justify-content:space-between;padding:5px 0}.grand{font-size:18px;font-weight:bold;border-top:1px solid #111;margin-top:5px;padding-top:9px!important}footer{text-align:center;margin-top:42px;color:#555;font-size:13px}@media print{body{margin:20px}}</style></head><body><header><div><h1>${escapeHtml(businessName)}</h1><p class="muted">${businessDetails.map((detail) => escapeHtml(detail as string)).join("<br>")}</p></div><div class="right"><h2>TAX INVOICE</h2><p class="muted">${escapeHtml(order.orderNumber)}<br>${escapeHtml(formatDate(order.createdAt))}</p></div></header><section class="details"><div><strong>Bill To</strong><p class="muted">${escapeHtml(order.customer?.name || order.customerName || "Walk-in Customer")}<br>${escapeHtml(order.customer?.phone || "")}</p></div><div class="right"><strong>Order</strong><p class="muted">${escapeHtml(order.orderType)}${order.table?.tableNumber ? `<br>Table ${escapeHtml(order.table.tableNumber)}` : ""}<br>Payment: ${escapeHtml(order.paymentStatus)}</p></div></section><table><thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead><tbody>${items}</tbody></table><section class="totals"><div><span>Subtotal</span><span>${currency}${order.subTotal.toFixed(2)}</span></div>${order.discountAmount > 0 ? `<div><span>Discount</span><span>-${currency}${order.discountAmount.toFixed(2)}</span></div>` : ""}<div><span>GST</span><span>${currency}${order.gstAmount.toFixed(2)}</span></div><div><span>Service charge</span><span>${currency}${order.serviceChargeAmount.toFixed(2)}</span></div><div class="grand"><span>Grand Total</span><span>${currency}${order.grandTotal.toFixed(2)}</span></div></section><footer>${escapeHtml(invoiceSettings?.invoiceFooter || "Thank you for visiting!")}</footer><script>window.onload=()=>window.print();<\/script></body></html>`,
    );
    invoiceWindow.document.close();
  };
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">{order.orderNumber}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Order Information */}
          <div className="grid gap-4 rounded-xl border border-gray-200 p-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">Order Number</p>
              <p className="mt-1 font-medium text-gray-900">
                {order.orderNumber}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="mt-1 font-medium text-gray-900">
                {formatDate(order.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="mt-1 font-medium text-gray-900">
                {order.customer?.name ||
                  order.customerName ||
                  "Walk-in Customer"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="mt-1 font-medium text-gray-900">
                {order.customer?.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Order Type</p>
              <p className="mt-1 font-medium text-gray-900">
                {order.orderType}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Table</p>
              <p className="mt-1 font-medium text-gray-900">
                {order.table?.tableNumber || "—"}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-gray-900">
              Order Items
            </h3>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Item
                    </th>

                    <th className="px-4 py-3 text-center font-medium text-gray-600">
                      Qty
                    </th>

                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Price
                    </th>

                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {order.items.map((item, index) => (
                    <tr key={`${item.menu}-${index}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.name}
                      </td>

                      <td className="px-4 py-3 text-center text-gray-600">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-3 text-right text-gray-600">
                        ₹{item.price.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ₹{item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Billing */}
          <div className="ml-auto max-w-sm space-y-3 rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>

              <span className="font-medium">₹{order.subTotal.toFixed(2)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Discount ({order.discountPercentage}%)
                </span>

                <span className="font-medium text-red-600">
                  -₹{order.discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                GST ({order.gstPercentage}%)
              </span>

              <span className="font-medium">₹{order.gstAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Service Charge ({order.serviceChargePercentage}%)
              </span>

              <span className="font-medium">
                ₹{order.serviceChargeAmount.toFixed(2)}
              </span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Grand Total</span>

                <span className="text-lg font-bold text-gray-900">
                  ₹{order.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Order Status</p>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                  order.status,
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Payment Status</p>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  order.paymentStatus === "Paid"
                    ? "bg-green-100 text-green-700"
                    : order.paymentStatus === "Refund Initiated"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 border-t pt-5 md:flex md:justify-end md:gap-3">
            <button
              type="button"
              onClick={printInvoice}
              className="w-full min-w-0 rounded-lg border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 md:w-auto md:px-4 md:text-sm"
            >
              Print Invoice
            </button>

            {order.paymentStatus === "Pending" && (
              <div className="flex w-full gap-2 md:w-auto">
                {/* Cash Payment */}
                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={() => onMarkAsPaid(order._id)}
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-4 md:text-sm"
                >
                  {paymentLoading ? "Processing..." : "Cash"}
                </button>

                {/* Online Payment */}
                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={() => onOnlinePayment(order._id)}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-4 md:text-sm"
                >
                  Online
                </button>
              </div>
            )}

            {canMarkAsServed && order.status === "Ready" && (
              <button
                type="button"
                disabled={servingLoading}
                onClick={() => onMarkAsServed(order._id)}
                className="w-full min-w-0 rounded-lg bg-purple-600 px-2 py-2 text-xs font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:px-4 md:text-sm"
              >
                {servingLoading
                  ? "Updating..."
                  : order.orderType === "Takeaway"
                    ? "Mark as Collected"
                    : "Mark as Served"}
              </button>
            )}

            {canCancelOrder &&
              order.status !== "Cancelled" &&
              order.status !== "Served" && (
                <button
                  type="button"
                  onClick={() => onCancelOrder(order)}
                  className="w-full min-w-0 rounded-lg border border-red-200 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 md:w-auto md:px-4 md:text-sm"
                >
                  Cancel Order
                </button>
              )}

            <button
              type="button"
              onClick={onClose}
              className="w-full min-w-0 rounded-lg border border-gray-300 px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 md:w-auto md:px-4 md:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;
