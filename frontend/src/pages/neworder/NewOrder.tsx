import { useEffect, useState } from "react";
import api from "../../api/axious";
import { toast } from "react-toastify";
import PaymentMethodModal from "../../components/orders/PaymentMethodModal";
import { useAuth } from "../../context/AuthContext";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface InventoryItem {
  _id: string;
  name: string;
  itemType: "Raw Material" | "Ready Item";
  unit: "kg" | "g" | "l" | "ml" | "pcs";
  quantity: number;
  minimumStock: number;
  buyingPrice: number;
  isActive: boolean;
}

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  inventory: InventoryItem;
  category: Category;
  sellingPrice: number;
  type: "Veg" | "Non-Veg";
  image?: string;
  isActive: boolean;
}

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved";
  isActive: boolean;
}

interface CartItem {
  menu: MenuItem;
  quantity: number;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
}

interface OrderSettings {
  gstPercentage: number;
  serviceChargePercentage: number;
  openingTime: string;
  closingTime: string;
}

const NewOrder = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [orderSettings, setOrderSettings] = useState<OrderSettings>({
    gstPercentage: 0,
    serviceChargePercentage: 0,
    openingTime: "09:00",
    closingTime: "22:00",
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [orderType, setOrderType] = useState<"Dine In" | "Takeaway">("Dine In");

  const [selectedTable, setSelectedTable] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [tablesLoading, setTablesLoading] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] =
    useState(false);

  const getMenu = async () => {
    try {
      setLoading(true);

      const response = await api.get("/menu");

      setMenuItems(response.data.data);
    } catch (error) {
      console.error("Failed to load menu:", error);
      toast.error("Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  };

  const getTables = async () => {
    try {
      setTablesLoading(true);

      const response = await api.get("/tables");

      setTables(response.data.data);
    } catch (error) {
      console.error("Failed to load tables:", error);
      toast.error("Failed to load tables.");
    } finally {
      setTablesLoading(false);
    }
  };

  const categories = [
    "All",
    ...Array.from(
      new Set(
        menuItems
          .filter((item) => item.isActive)
          .map((item) => item.category?.name)
          .filter(Boolean),
      ),
    ),
  ];

  const filteredMenu = menuItems.filter((item) => {
    if (!item.isActive) {
      return false;
    }

    const searchValue = search.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchValue) ||
      item.category?.name.toLowerCase().includes(searchValue) ||
      item.type.toLowerCase().includes(searchValue);

    const matchesCategory =
      selectedCategory === "All" || item.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const availableTables = tables.filter(
    (table) => table.isActive && table.status === "Available",
  );

  const handleOrderTypeChange = (type: "Dine In" | "Takeaway") => {
    setOrderType(type);

    if (type === "Takeaway") {
      setSelectedTable("");
    }
  };

  const lookUpCustomer = async () => {
    const phone = customerPhone.trim();

    if (!phone) {
      setMatchedCustomer(null);
      return;
    }

    if (phone.length < 10) {
      toast.error("Enter a valid customer phone number.");
      return;
    }

    try {
      setCustomerLookupLoading(true);
      const response = await api.get("/customers/active", {
        params: { search: phone },
      });
      const customer = (response.data.data as Customer[]).find(
        (result) => result.phone === phone,
      );

      setMatchedCustomer(customer ?? null);

      if (customer) {
        setCustomerName(customer.name);
        toast.success(`Customer found: ${customer.name}`);
      }
    } catch (error) {
      console.error("Failed to look up customer:", error);
      toast.error("Failed to look up customer.");
    } finally {
      setCustomerLookupLoading(false);
    }
  };

  const getOrderSettings = async () => {
    try {
      const response = await api.get("/settings");
      setOrderSettings({
        gstPercentage: response.data.data.gstPercentage,
        serviceChargePercentage: response.data.data.serviceChargePercentage,
        openingTime: response.data.data.openingTime,
        closingTime: response.data.data.closingTime,
      });
    } catch (error) {
      console.error("Failed to load billing settings:", error);
      toast.error("Failed to load GST and service-charge settings.");
    }
  };

  useEffect(() => {
    getMenu();
    getTables();
    getOrderSettings();
  }, []);

  // Add item to cart
  const addToCart = (menuItem: MenuItem) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.menu._id === menuItem._id,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.menu._id === menuItem._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          menu: menuItem,
          quantity: 1,
        },
      ];
    });
  };

  // Increase quantity
  const increaseQuantity = (menuId: string) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.menu._id === menuId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  // Decrease quantity
  const decreaseQuantity = (menuId: string) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.menu._id === menuId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) => total + item.menu.sellingPrice * item.quantity,
    0,
  );
  const discountAmount = (subtotal * discountPercentage) / 100;
  const totalAfterDiscount = subtotal - discountAmount;

  const gstAmount = (totalAfterDiscount * orderSettings.gstPercentage) / 100;

  const serviceChargeAmount =
    (totalAfterDiscount * orderSettings.serviceChargePercentage) / 100;

  const orderTotal = totalAfterDiscount + gstAmount + serviceChargeAmount;

  const isRestaurantOpen = () => {
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openingHour, openingMinute] = orderSettings.openingTime
      .split(":")
      .map(Number);

    const [closingHour, closingMinute] = orderSettings.closingTime
      .split(":")
      .map(Number);

    const openingMinutes = openingHour * 60 + openingMinute;

    const closingMinutes = closingHour * 60 + closingMinute;

    return currentMinutes >= openingMinutes && currentMinutes <= closingMinutes;
  };

  const placeOrder = async (paymentStatus: "Paid" | "Pending") => {
    if (cart.length === 0) {
      return;
    }

    if (orderType === "Dine In" && !selectedTable) {
      return;
    }

    if (customerPhone.trim() && customerName.trim().length < 2) {
      toast.error("Enter the customer's name to create a customer record.");
      return;
    }

    try {
      setPlacingOrder(true);

      const payload = {
        items: cart.map((item) => ({
          menu: item.menu._id,
          quantity: item.quantity,
        })),

        orderType,

        table: orderType === "Dine In" ? selectedTable : null,

        customerName: customerName.trim() || undefined,

        customerPhone: customerPhone.trim() || undefined,

        discountPercentage:
          user?.role === "Cashier" || user?.role === "Manager"
            ? discountPercentage
            : 0,

        paymentStatus,
      };

      const response = await api.post("/orders", payload);

      const createdOrder = response.data.data;

      setCart([]);
      setSelectedTable("");
      setCustomerName("");
      setCustomerPhone("");
      setMatchedCustomer(null);
      setDiscountPercentage(0);
      setOrderType("Dine In");
      setShowPaymentModal(false);
      await getTables();
      toast.success(
        `Order ${createdOrder.orderNumber} created. Total: ₹${createdOrder.grandTotal.toFixed(2)}`,
      );
      return createdOrder;
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error(
        "Failed to create order. Please check the table and stock, then try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4 overflow-hidden lg:h-[calc(100vh-2rem)] lg:flex-row">
      {/* LEFT - MENU */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">New Order</h1>

          <p className="mt-1 text-sm text-gray-500">
            Select menu items to create a new order
          </p>
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="🔍 Search menu items..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Categories */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "border-[#221b18] bg-[#221b18] text-[#f0d9b6]"
                  : "border-[#d9c9b3] bg-white text-[#4a3f38] hover:bg-[#f9f6f2]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {filteredMenu.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filteredMenu.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => addToCart(item)}
                  className="rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition hover:border-gray-400 hover:shadow-md"
                >
                  {/* Menu Image */}
                  <div className="h-32 overflow-hidden rounded-lg bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="mt-3 line-clamp-1 text-sm font-semibold text-gray-900">
                    {item.name}
                  </h3>

                  {/* Type + Category */}
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <span
                      className={
                        item.type === "Veg" ? "text-green-600" : "text-red-600"
                      }
                    >
                      ●
                    </span>

                    <span>{item.type}</span>

                    <span>•</span>

                    <span className="truncate">{item.category?.name}</span>
                  </div>

                  {/* Price */}
                  <p className="mt-2 text-sm font-bold text-red-600">
                    ₹{item.sellingPrice.toFixed(2)}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-0 w-full flex-col overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm lg:w-[360px]">
              <p className="text-sm text-gray-500">No menu items found.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT - CURRENT ORDER */}
      <div className="flex min-h-0 w-[360px] flex-col overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="shrink-0 border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Order</h2>
        </div>

        {/* Order Type + Table */}
        <div className="shrink-0 border-b p-5">
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-700">
                Customer{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </p>
              {matchedCustomer && (
                <span className="text-xs font-medium text-green-700">
                  Existing customer
                </span>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="tel"
                value={customerPhone}
                onChange={(event) => {
                  setCustomerPhone(event.target.value);
                  setMatchedCustomer(null);
                }}
                onBlur={lookUpCustomer}
                placeholder="Phone number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />

              <input
                type="text"
                value={customerName}
                onChange={(event) => {
                  setCustomerName(event.target.value);
                  setMatchedCustomer(null);
                }}
                placeholder={
                  customerLookupLoading
                    ? "Looking up customer..."
                    : "Customer name"
                }
                disabled={customerLookupLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
              />
            </div>

            {customerPhone && !matchedCustomer && !customerLookupLoading && (
              <p className="mt-2 text-xs text-gray-500">
                New customer? Enter their name and it will be saved with this
                order.
              </p>
            )}
          </div>

          <p className="mb-2 text-sm font-medium text-gray-700">Order Type</p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleOrderTypeChange("Dine In")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                orderType === "Dine In"
                  ? "border-[#221b18] bg-[#221b18] text-[#f0d9b6]"
                  : "border-[#d9c9b3] bg-white text-[#4a3f38] hover:bg-[#f9f6f2]"
              }`}
            >
              Dine In
            </button>

            <button
              type="button"
              onClick={() => handleOrderTypeChange("Takeaway")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                orderType === "Takeaway"
                  ? "border-[#221b18] bg-[#221b18] text-[#f0d9b6]"
                  : "border-[#d9c9b3] bg-white text-[#4a3f38] hover:bg-[#f9f6f2]"
              }`}
            >
              Takeaway
            </button>
          </div>

          {/* Table */}
          {orderType === "Dine In" && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Table
              </label>

              <select
                value={selectedTable}
                onChange={(event) => setSelectedTable(event.target.value)}
                disabled={tablesLoading}
                className="min-w-0 w-full max-w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
              >
                <option value="">
                  {tablesLoading ? "Loading tables..." : "Select a table"}
                </option>

                {availableTables.map((table) => (
                  <option key={table._id} value={table._id}>
                    Table {table.tableNumber} — {table.capacity} seats
                  </option>
                ))}
              </select>

              {!tablesLoading && availableTables.length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  No available tables.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="min-h-[12rem] flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center p-5">
              <div className="text-center">
                <div className="text-5xl">🛒</div>

                <p className="mt-3 text-sm font-medium text-gray-700">
                  Cart is empty
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Tap on a menu item to add it to the order.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.menu._id} className="p-4">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.menu.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        ₹{item.menu.sellingPrice.toFixed(2)} each
                      </p>
                    </div>

                    <p className="whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{(item.menu.sellingPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.menu._id)}
                        className="px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                      >
                        −
                      </button>

                      <span className="min-w-8 border-x border-gray-300 px-2 py-1.5 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.menu._id)}
                        className="px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setCart((currentCart) =>
                          currentCart.filter(
                            (cartItem) => cartItem.menu._id !== item.menu._id,
                          ),
                        )
                      }
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing */}
        <div className="shrink-0 border-t p-5">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>

            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>

          {(user?.role === "Cashier" || user?.role === "Manager") && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={discountPercentage}
                onChange={(event) =>
                  setDiscountPercentage(
                    Math.min(10, Math.max(0, Number(event.target.value))),
                  )
                }
                className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
              />
            </div>
          )}

          {discountPercentage > 0 && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-500">
                Discount ({discountPercentage}%)
              </span>
              <span className="font-medium text-red-600">
                -₹{discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* GST */}
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">
              GST ({orderSettings.gstPercentage}%)
            </span>

            <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
          </div>

          {/* Service Charge */}
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">
              Service Charge ({orderSettings.serviceChargePercentage}%)
            </span>

            <span className="font-medium">
              ₹{serviceChargeAmount.toFixed(2)}
            </span>
          </div>

          {/* Total */}
          <div className="mt-4 flex justify-between border-t pt-4">
            <span className="font-semibold text-gray-900">Total</span>

            <span className="font-bold text-gray-900">
              ₹{orderTotal.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            disabled={
              cart.length === 0 || (orderType === "Dine In" && !selectedTable)
            }
            onClick={() => {
              if (!isRestaurantOpen()) {
                toast.error("Restaurant is not operative at this time.");
                return;
              }

              if (user?.role === "Waiter") {
                void placeOrder("Pending");
                return;
              }

              setShowPaymentModal(true);
            }}
            className="mt-5 w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Place Order
          </button>
        </div>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Complete Order
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the payment option.
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-500">Total Amount</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ₹{orderTotal.toFixed(2)}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={placingOrder}
                  onClick={() => setIsPaymentMethodModalOpen(true)}
                  className="btn-primary"
                >
                  {placingOrder ? "Processing..." : "Pay Now"}
                </button>

                <button
                  type="button"
                  disabled={placingOrder}
                  onClick={() => placeOrder("Pending")}
                  className="btn-secondary"
                >
                  Pay Later
                </button>
              </div>

              <button
                type="button"
                disabled={placingOrder}
                onClick={() => setShowPaymentModal(false)}
                className="mt-4 w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentMethodModal
        isOpen={isPaymentMethodModalOpen}
        onClose={() => setIsPaymentMethodModalOpen(false)}
        onCash={() => {
          setIsPaymentMethodModalOpen(false);
          placeOrder("Paid");
        }}
        onOnline={async () => {
          setIsPaymentMethodModalOpen(false);

          try {
            const createdOrder = await placeOrder("Pending");

            if (!createdOrder) {
              return;
            }

            const razorpayResponse = await api.post(
              "/payments/razorpay/create-order",
              {
                orderId: createdOrder._id,
              },
            );

            const razorpayOrder = razorpayResponse.data.data.razorpayOrder;

            console.log("Razorpay Order:", razorpayOrder);

            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID,
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency,
              name: "Warisoft POS",
              description: `Payment for ${razorpayOrder.receipt}`,
              order_id: razorpayOrder.id,

              handler: async function (response: any) {
                try {
                  console.log("Razorpay payment response:", response);

                  const verifyResponse = await api.post(
                    "/payments/razorpay/verify",
                    {
                      razorpayOrderId: response.razorpay_order_id,

                      razorpayPaymentId: response.razorpay_payment_id,

                      razorpaySignature: response.razorpay_signature,
                    },
                  );

                  console.log(
                    "Payment verification response:",
                    verifyResponse.data,
                  );

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

            razorpay.on("payment.failed", (response: any) => {
              console.error("Razorpay payment failed:", response);

              toast.error(
                response.error?.description ||
                  "Payment failed. The order remains pending.",
              );
            });

            razorpay.on("modal.closed", () => {
              toast.info("Payment cancelled. The order remains pending.");
            });

            razorpay.open();
          } catch (error) {
            console.error("Online payment failed:", error);

            toast.error("Unable to initiate online payment.");
          }
        }}
      />
    </div>
  );
};

export default NewOrder;
