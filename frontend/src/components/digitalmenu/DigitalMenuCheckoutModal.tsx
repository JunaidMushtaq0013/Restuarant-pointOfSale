import { useState } from "react";

interface CartItem {
  menu: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface Table {
  _id: string;
  tableNumber: number;
}

interface DigitalMenuCheckoutModalProps {
  cart: CartItem[];
  table: Table | null;
  onClose: () => void;
  onPlaceOrder: (
    customerName: string,
    customerPhone: string,
  ) => void;
}

const DigitalMenuCheckoutModal = ({
  cart,
  table,
  onClose,
  onPlaceOrder,
}: DigitalMenuCheckoutModalProps) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee7df] pb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#211e1b]">
              Checkout
            </h2>

            {table && (
              <p className="mt-1 text-xs text-[#8b8178]">
                Table {table.tableNumber}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-[#211e1b] hover:bg-[#f3eee8]"
          >
            ×
          </button>
        </div>

        {/* Customer Details */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#6f6258]">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-[#ddd5ca] px-3 py-2.5 text-sm outline-none focus:border-[#211e1b]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#6f6258]">
              Phone Number
            </label>

            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full rounded-xl border border-[#ddd5ca] px-3 py-2.5 text-sm outline-none focus:border-[#211e1b]"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-5 max-h-[30vh] space-y-3 overflow-y-auto border-t border-[#eee7df] pt-4">
          {cart.map((item) => (
            <div
              key={item.menu}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-[#211e1b]">
                  {item.name} × {item.quantity}
                </p>

                {item.note && (
                  <p className="mt-1 text-xs text-[#8b8178]">
                    Note: {item.note}
                  </p>
                )}
              </div>

              <p className="text-sm font-medium text-[#211e1b]">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="mt-4 flex items-center justify-between border-t border-[#eee7df] pt-4">
          <span className="text-sm text-[#8b8178]">
            Subtotal
          </span>

          <span className="text-lg font-semibold text-[#211e1b]">
            ₹{subtotal.toFixed(2)}
          </span>
        </div>

        {/* Place Order */}
        <button
  type="button"
  onClick={() => onPlaceOrder(customerName, customerPhone)}
  className="mt-4 w-full rounded-full bg-[#211e1b] py-3 text-sm font-medium text-white transition hover:bg-[#3a342f]"
>
  Place Order
</button>
      </div>
    </div>
  );
};

export default DigitalMenuCheckoutModal;