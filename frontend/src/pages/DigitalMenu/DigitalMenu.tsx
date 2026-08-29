import { useEffect, useState } from "react";
import api from "../../api/axious";
import { toast } from "react-toastify";

import DigitalMenuCartModal from "../../components/digitalmenu/digitalmenuCartmodel";
import DigitalMenuCheckoutModal from "../../components/digitalmenu/DigitalMenuCheckoutModal";

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

const CART_STORAGE_KEY = "digital_menu_cart";

const DigitalMenu = () => {
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

      console.log("QR order created:", response.data);

      setCart([]);
      localStorage.removeItem("digital_menu_cart");
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f3ed] px-4">
        <p className="text-center text-sm text-gray-500">Loading menu...</p>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f3ed] px-4">
        <p className="text-center text-sm text-red-500">
          {error || "Unable to load menu."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ed] text-[#26221e]">
      {/* ================= HERO ================= */}
      <header className="relative overflow-hidden bg-[#211e1b] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.10),_transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 sm:py-16 md:py-20">
          {/* Logo */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 shadow-2xl sm:mb-6 sm:h-24 sm:w-24">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.restaurantName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-semibold tracking-wider sm:text-2xl">
                {(settings.initials || settings.restaurantName.slice(0, 2))
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-white/50 sm:mb-3 sm:text-xs sm:tracking-[0.35em]">
            Welcome
          </p>

          <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            {settings.restaurantName}
          </h1>

          <div className="mx-auto mt-4 max-w-md text-xs leading-5 text-white/60 sm:mt-6 sm:text-sm">
            {settings.restaurantAddress}
          </div>

          <div className="mt-1 text-xs text-white/50 sm:mt-2 sm:text-sm">
            {settings.phone}
          </div>

          {tableLoading ? (
            <p>Identifying table...</p>
          ) : table ? (
            <p>Table {table.tableNumber}</p>
          ) : (
            <p>Unable to identify table.</p>
          )}
        </div>
      </header>

      {/* ================= CATEGORY NAVIGATION ================= */}
      <div className="sticky top-0 z-20 border-b border-[#ddd5ca] bg-[#f7f3ed]/95 backdrop-blur">
        <div className="mx-auto max-w-5xl overflow-x-auto px-4 sm:px-5">
          <div className="flex min-w-max gap-5 py-3 sm:gap-6 sm:py-4">
            {Object.keys(groupedMenu).map((categoryName) => (
              <a
                key={categoryName}
                href={`#${categoryName.toLowerCase().replace(/\s+/g, "-")}`}
                className="shrink-0 text-xs font-medium text-[#5f5750] transition hover:text-[#211e1b] sm:text-sm"
              >
                {categoryName}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MENU ================= */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 md:py-16">
        {/* Menu Heading */}
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8b8178] sm:text-xs sm:tracking-[0.35em]">
            Discover
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#211e1b] sm:mt-3 sm:text-4xl md:text-5xl">
            Our Menu
          </h2>

          <div className="mx-auto mt-4 h-px w-12 bg-[#b8aa9b] sm:mt-5 sm:w-16" />
        </div>

        {/* Categories */}
        <div className="space-y-14 sm:space-y-20">
          {Object.entries(groupedMenu).map(([categoryName, items]) => (
            <section
              key={categoryName}
              id={categoryName.toLowerCase().replace(/\s+/g, "-")}
              className="scroll-mt-20 sm:scroll-mt-24"
            >
              {/* Category heading */}
              <div className="mb-6 flex items-end justify-between gap-3 border-b border-[#d8d0c6] pb-3 sm:mb-8 sm:pb-4">
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#9a8e82] sm:mb-2 sm:text-xs sm:tracking-[0.25em]">
                    Menu
                  </p>

                  <h3 className="break-words text-2xl font-semibold tracking-tight text-[#211e1b] sm:text-3xl">
                    {categoryName}
                  </h3>
                </div>

                <span className="shrink-0 text-xs text-[#9a8e82] sm:text-sm">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items */}
              <div className="grid gap-x-6 gap-y-6 sm:gap-x-8 sm:gap-y-8 md:grid-cols-2 md:gap-x-10">
                {items.map((item) => {
                  const isOutOfStock = item.inventory.quantity <= 0;

                  return (
                    <article
                      key={item._id}
                      className={`group flex min-w-0 gap-3 border-b border-[#ded7ce] pb-6 sm:gap-4 sm:pb-8 ${
                        isOutOfStock ? "opacity-60" : ""
                      }`}
                    >
                      {/* Image */}
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#e8e0d6] sm:h-28 sm:w-28 sm:rounded-xl md:h-32 md:w-32">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-[#9a8e82] sm:text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          {/* Name + Price */}
                          <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
                            <h4 className="min-w-0 break-words text-base font-semibold leading-snug text-[#211e1b] sm:text-lg">
                              {item.name}
                            </h4>

                            <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-[#211e1b] sm:text-lg">
                              {settings.currency}
                              {item.sellingPrice.toFixed(2)}
                            </span>
                          </div>

                          {/* Description */}
                          {item.description && (
                            <p className="mt-1 text-xs leading-5 text-[#8b8178] sm:text-sm">
                              {item.description}
                            </p>
                          )}

                          {/* Type */}
                          <div className="mt-2 sm:mt-3">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-medium sm:text-xs ${
                                item.type === "Veg"
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${
                                  item.type === "Veg"
                                    ? "bg-green-600"
                                    : "bg-red-600"
                                }`}
                              />

                              {item.type}
                            </span>
                          </div>

                          {/* Out of Stock */}
                          {isOutOfStock && (
                            <span className="mt-2 inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700 sm:text-xs">
                              Out of Stock
                            </span>
                          )}

                          {!isOutOfStock && (
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="mt-3 w-fit rounded-full border border-[#211e1b] px-4 py-1.5 text-xs font-medium text-[#211e1b] transition hover:bg-[#211e1b] hover:text-white"
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
        <div className="sticky bottom-0 z-30 border-t border-[#ddd5ca] bg-white/95 px-4 py-4 shadow-lg backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#211e1b]">
                {cart.reduce((total, item) => total + item.quantity, 0)}{" "}
                {cart.length === 1 ? "item" : "items"}
              </p>

              <p className="text-xs text-[#8b8178]">
                ₹
                {cart
                  .reduce(
                    (total, item) => total + item.price * item.quantity,
                    0,
                  )
                  .toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCart(true)}
              className="rounded-full bg-[#211e1b] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#3a342f] sm:px-6 sm:text-sm"
            >
              View Cart
            </button>
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#ddd5ca] bg-[#211e1b] px-4 py-10 text-center text-white sm:px-5 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 sm:h-14 sm:w-14">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.restaurantName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold sm:text-sm">
                {(settings.initials || settings.restaurantName.slice(0, 2))
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold sm:text-xl">
            {settings.restaurantName}
          </h3>

          <p className="mt-2 text-xs text-white/50 sm:text-sm">
            {settings.restaurantAddress}
          </p>

          <p className="mt-1 text-xs text-white/50 sm:text-sm">
            {settings.phone}
          </p>

          <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-white/30 sm:mt-8 sm:text-xs sm:tracking-[0.25em]">
            Thank you for visiting
          </p>
        </div>
      </footer>

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
