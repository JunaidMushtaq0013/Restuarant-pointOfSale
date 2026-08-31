import { useEffect, useState } from "react";
import api from "../../api/axious";
import { toast } from "react-toastify";

import DigitalMenuCartModal from "../../components/digitalmenu/digitalmenuCartmodel";
import DigitalMenuCheckoutModal from "../../components/digitalmenu/DigitalMenuCheckoutModal";
import DigitalMenuOrderStatus from "../../components/digitalmenu/DigitalMenuOrderStatus";

import { socket } from "../../socket";
interface PublicMenuItem {
  _id: string;
  name: string;
  description?: string;
  sellingPrice: number;
  type: "Veg" | "Non-Veg";
  image?: string;

  inventory: {
    _id: string;
    quantity: number;
    unit: string;
  };

  category: {
    _id: string;
    name: string;
  };
}

interface CartItem {
  menu: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface PublicSettings {
  restaurantName: string;
  logoUrl?: string;
  initials?: string;
  restaurantAddress: string;
  phone: string;
  currency: string;
}

interface ActiveOrder {
  orderNumber: string;
  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";
}

const CART_STORAGE_KEY = "digital_menu_cart";
const ORDER_TOKEN_STORAGE_KEY = "digital_menu_order_token";

// Presentational only — background tint for the active-order banner.
const STATUS_BG: Record<ActiveOrder["status"], string> = {
  Pending: "bg-amber-50",
  Preparing: "bg-[#B8924A]/10",
  Ready: "bg-[#35513F]/10",
  Served: "bg-stone-100",
  Cancelled: "bg-red-50",
};

const DigitalMenu = () => {
  useEffect(() => {
    const handleNewOrder = (order: { orderNumber: string; status: string }) => {
      console.log("🍽️ New order received:", order);
    };

    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
    };
  }, []);
  const [menu, setMenu] = useState<PublicMenuItem[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [table, setTable] = useState<{
    _id: string;
    tableNumber: number;
    capacity: number;
    status: string;
  } | null>(null);

  const [tableLoading, setTableLoading] = useState(true);

  const [showCheckout, setShowCheckout] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (!savedCart) {
        return [];
      }

      return JSON.parse(savedCart);
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      return [];
    }
  });

  const [showCart, setShowCart] = useState(false);

  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

  // ================= FETCH MENU =================

  useEffect(() => {
    const fetchDigitalMenu = async () => {
      try {
        setLoading(true);
        setError("");

        const [settingsResponse, menuResponse] = await Promise.all([
          api.get("/settings/public"),
          api.get("/menu/public"),
        ]);

        setSettings(settingsResponse.data.data);
        setMenu(menuResponse.data.data);
      } catch (error) {
        console.error("Failed to load digital menu:", error);
        setError("Unable to load menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchDigitalMenu();
  }, []);

  // ================= GET TABLE FROM QR =================

  useEffect(() => {
    const getTableFromQr = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const tableToken = params.get("tableToken");

        if (!tableToken) {
          toast.error("Invalid table QR code.");
          return;
        }

        const response = await api.get(`/tables/qr/${tableToken}`);

        setTable(response.data.data);
      } catch (error) {
        console.error("Failed to identify table:", error);
        toast.error("Invalid or inactive table QR code.");
      } finally {
        setTableLoading(false);
      }
    };

    getTableFromQr();
  }, []);

  // ================= SAVE CART =================

  useEffect(() => {
    try {
      if (cart.length === 0) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cart]);

  // ================= RESTORE ACTIVE QR ORDER =================

  useEffect(() => {
    const token = localStorage.getItem(ORDER_TOKEN_STORAGE_KEY);

    if (!token) {
      return;
    }

    const getActiveOrder = async () => {
      try {
        const response = await api.get(`/orders/qr/status/${token}`);

        const order = response.data.data;

        if (order.status === "Served" || order.status === "Cancelled") {
          setActiveOrder(null);
          localStorage.removeItem(ORDER_TOKEN_STORAGE_KEY);
          return;
        }

        setActiveOrder({
          orderNumber: order.orderNumber,
          status: order.status,
        });
      } catch (error) {
        console.error("Failed to restore active QR order:", error);

        localStorage.removeItem(ORDER_TOKEN_STORAGE_KEY);
        setActiveOrder(null);
      }
    };

    getActiveOrder();
  }, []);

  // socket useeffect
  useEffect(() => {
    const handleOrderStatusUpdated = (order: {
      orderNumber: string;
      status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled";
    }) => {
      console.log("🔄 Order status updated:", order.orderNumber, order.status);

      const token = localStorage.getItem("digital_menu_order_token");

      if (!token) {
        return;
      }

      if (order.status === "Served" || order.status === "Cancelled") {
        setActiveOrder(null);

        localStorage.removeItem("digital_menu_order_token");

        return;
      }

      setActiveOrder({
        orderNumber: order.orderNumber,
        status: order.status,
      });
    };

    socket.on("orderStatusUpdated", handleOrderStatusUpdated);

    return () => {
      socket.off("orderStatusUpdated", handleOrderStatusUpdated);
    };
  }, []);

  // ================= GROUP MENU =================

  const groupedMenu = menu.reduce<Record<string, PublicMenuItem[]>>(
    (groups, item) => {
      const categoryName = item.category.name;

      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }

      groups[categoryName].push(item);

      return groups;
    },
    {},
  );

  // ================= CART FUNCTIONS =================

  const addToCart = (item: PublicMenuItem) => {
    if (item.inventory.quantity <= 0) {
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.menu === item._id,
      );

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.menu === item._id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem,
        );
      }

      return [
        ...prevCart,
        {
          menu: item._id,
          name: item.name,
          price: item.sellingPrice,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (menuId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.menu === menuId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (menuId: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.menu === menuId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (menuId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.menu !== menuId));
  };

  const updateCartNote = (menuId: string, note: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.menu === menuId
          ? {
              ...item,
              note: note.trim() || undefined,
            }
          : item,
      ),
    );
  };

  // ================= PLACE QR ORDER =================

  const placeQrOrder = async (customerName: string, customerPhone: string) => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!table) {
      toast.error("Unable to identify table.");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!customerPhone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    try {
      const payload = {
        source: "QR",

        customerName: customerName.trim(),

        customerPhone: customerPhone.trim(),

        items: cart.map((item) => ({
          menu: item.menu,
          quantity: item.quantity,
          note: item.note,
        })),

        orderType: "Dine In",

        table: table._id,

        paymentStatus: "Pending",
      };

      const response = await api.post("/orders/qr", payload);

      const createdOrder = response.data.data;

      // Save secure token
      if (createdOrder.source === "QR" && createdOrder.orderAccessToken) {
        localStorage.setItem(
          ORDER_TOKEN_STORAGE_KEY,
          createdOrder.orderAccessToken,
        );
      }

      // Show newly created order
      setActiveOrder({
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
      });

      // Clear cart
      setCart([]);

      localStorage.removeItem(CART_STORAGE_KEY);

      // Close checkout
      setShowCheckout(false);

      toast.success("Order placed successfully.");
    } catch (error) {
      console.error("Failed to place QR order:", error);

      toast.error(
        (
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        ).response?.data?.message || "Failed to place order. Please try again.",
      );
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6EF] px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E4DBC9] border-t-[#35513F]" />
          <p className="text-sm text-[#8A8175]">Loading menu…</p>
        </div>
      </div>
    );
  }

  // ================= ERROR =================

  if (error || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF6EF] px-6">
        <div className="max-w-xs text-center">
          <p className="font-serif text-lg text-[#1C1917]">Menu unavailable</p>
          <p className="mt-2 text-sm text-[#9B4630]">
            {error || "Unable to load menu."}
          </p>
        </div>
      </div>
    );
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-[#1C1917]">
      {/* ================= HERO ================= */}

      <header className="relative overflow-hidden bg-[#1C1917] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(184,146,74,0.12),_transparent_45%)]" />

        <div className="relative mx-auto max-w-2xl px-5 pb-7 pt-8 text-center sm:max-w-5xl sm:px-6 sm:pb-14 sm:pt-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 sm:mb-6 sm:h-24 sm:w-24">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.restaurantName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-serif text-lg text-white/90 sm:text-2xl">
                {(settings.initials || settings.restaurantName.slice(0, 2))
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="break-words font-serif text-[28px] leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {settings.restaurantName}
          </h1>

          <div className="mx-auto mt-3 max-w-xs text-[13px] leading-5 text-white/55 sm:max-w-md sm:mt-4 sm:text-sm">
            {settings.restaurantAddress}
          </div>

          <div className="mt-1 text-[13px] text-white/45 sm:text-sm">
            {settings.phone}
          </div>

          <div className="mt-4 flex justify-center sm:mt-6">
            {tableLoading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs text-white/50">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
                Finding your table…
              </span>
            ) : table ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B8924A]" />
                Table {table.tableNumber}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs text-red-200">
                Table not recognized
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ================= ACTIVE ORDER BANNER ================= */}

      {activeOrder && (
        <div
          className={`${STATUS_BG[activeOrder.status]} border-b border-[#E4DBC9]`}
        >
          <div className="mx-auto max-w-5xl px-4 py-2.5 sm:px-6">
            <DigitalMenuOrderStatus
              orderNumber={activeOrder.orderNumber}
              status={activeOrder.status}
            />
          </div>
        </div>
      )}

      {/* ================= CATEGORY NAVIGATION ================= */}

      <div className="sticky top-0 z-20 border-b border-[#E4DBC9] bg-[#FAF6EF]/95 backdrop-blur">
        <div className="mx-auto max-w-5xl overflow-x-auto px-4 sm:px-5">
          <div className="flex min-w-max gap-2 py-2.5 sm:gap-2.5 sm:py-3">
            {Object.keys(groupedMenu).map((categoryName) => (
              <a
                key={categoryName}
                href={`#${categoryName.toLowerCase().replace(/\s+/g, "-")}`}
                className="shrink-0 rounded-full border border-[#E4DBC9] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#5f5750] transition active:scale-95 active:bg-[#1C1917] active:text-white sm:text-sm"
              >
                {categoryName}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MENU ================= */}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14 md:py-16">
        <div className="space-y-10 sm:space-y-16">
          {Object.entries(groupedMenu).map(([categoryName, items]) => (
            <section
              key={categoryName}
              id={categoryName.toLowerCase().replace(/\s+/g, "-")}
              className="scroll-mt-16 sm:scroll-mt-20"
            >
              {/* Category heading */}

              <div className="mb-4 flex items-baseline justify-between gap-3 sm:mb-6">
                <h3 className="break-words font-serif text-xl tracking-tight text-[#1C1917] sm:text-3xl">
                  {categoryName}
                </h3>

                <span className="shrink-0 text-xs text-[#9a8e82] sm:text-sm">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items */}

              <div className="md:grid md:grid-cols-2 md:gap-x-10">
                {items.map((item) => {
                  const isOutOfStock = item.inventory.quantity <= 0;
                  const cartItem = cart.find((c) => c.menu === item._id);

                  return (
                    <article
                      key={item._id}
                      className={`flex min-w-0 gap-3 rounded-2xl border border-[#E4DBC9] bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:mb-5 ${
                        isOutOfStock ? "opacity-50" : ""
                      }`}
                    >
                      {/* Image */}

                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F1EAD9] sm:h-24 sm:w-24">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-[#9a8e82]">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Content */}

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {/* Veg / Non-Veg marker */}
                              <span
                                className={`flex h-3 w-3 shrink-0 items-center justify-center border ${
                                  item.type === "Veg"
                                    ? "border-[#35513F]"
                                    : "border-[#9B4630]"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    item.type === "Veg"
                                      ? "bg-[#35513F]"
                                      : "bg-[#9B4630]"
                                  }`}
                                />
                              </span>

                              <h4 className="min-w-0 truncate font-serif text-[15px] leading-snug text-[#1C1917] sm:text-lg">
                                {item.name}
                              </h4>
                            </div>

                            {item.description && (
                              <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-[#8b8178] sm:text-sm">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-[#1C1917] sm:text-base">
                            {settings.currency}
                            {item.sellingPrice.toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-2.5">
                          {isOutOfStock ? (
                            <span className="inline-flex w-fit rounded-full bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#9B4630]">
                              Out of stock
                            </span>
                          ) : cartItem ? (
                            <div className="inline-flex items-center gap-3 rounded-full border border-[#E4DBC9] bg-white px-1 py-1">
                              <button
                                type="button"
                                onClick={() => decreaseQuantity(item._id)}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-[#1C1917] active:bg-[#F1EAD9]"
                                aria-label={`Remove one ${item.name}`}
                              >
                                −
                              </button>
                              <span className="min-w-[1ch] text-sm font-medium text-[#1C1917]">
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseQuantity(item._id)}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-[#1C1917] active:bg-[#F1EAD9]"
                                aria-label={`Add one more ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="rounded-full border border-[#1C1917] px-4 py-1.5 text-xs font-medium text-[#1C1917] transition active:bg-[#1C1917] active:text-white"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* ================= CART ================= */}

      {cart.length > 0 && (
        <div className="sticky bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-0">
          <div className="mx-auto max-w-5xl">
            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="flex w-full items-center justify-between gap-4 rounded-2xl bg-[#1C1917] px-5 py-3.5 text-white shadow-[0_8px_24px_rgba(28,25,23,0.35)]"
            >
              <span className="flex items-center gap-2 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B8924A] text-xs font-semibold text-[#1C1917]">
                  {cartCount}
                </span>
                {cartCount === 1 ? "item" : "items"}
              </span>

              <span className="text-sm font-semibold">
                {settings.currency}
                {cartTotal.toFixed(2)}
              </span>

              <span className="text-sm font-medium text-[#B8924A]">
                View cart →
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-[#E4DBC9] bg-[#1C1917] px-5 py-8 text-center text-white/50 sm:py-10">
        <p className="font-serif text-sm text-white/80">
          {settings.restaurantName}
        </p>
        <p className="mt-1 text-xs">{settings.restaurantAddress}</p>
        <p className="mt-0.5 text-xs">{settings.phone}</p>
      </footer>

      {/* ================= CART MODAL ================= */}

      {showCart && (
        <DigitalMenuCartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          onRemove={removeFromCart}
          onUpdateNote={updateCartNote}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
        />
      )}

      {/* ================= CHECKOUT MODAL ================= */}

      {showCheckout && (
        <DigitalMenuCheckoutModal
          cart={cart}
          table={table}
          onClose={() => setShowCheckout(false)}
          onPlaceOrder={placeQrOrder}
        />
      )}
    </div>
  );
};

export default DigitalMenu;
