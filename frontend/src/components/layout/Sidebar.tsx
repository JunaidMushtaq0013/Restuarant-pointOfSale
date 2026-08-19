import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../api/axious";
import { useAuth } from "../../context/AuthContext";
import type { IconType } from "react-icons";
import {
  MdAddShoppingCart,
  MdBadge,
  MdCategory,
  MdDashboard,
  MdInventory2,
  MdKitchen,
  MdPeople,
  MdReceiptLong,
  MdRestaurantMenu,
  MdSettings,
  MdTableRestaurant,
} from "react-icons/md";

interface SidebarProps {
  onNavigate?: () => void;
}

interface SidebarBrand {
  restaurantName: string;
  logoUrl?: string;
  initials?: string;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const { user } = useAuth();
  const [brand, setBrand] = useState<SidebarBrand>({
    restaurantName: "Warisoft POS",
    initials: "WP",
  });

  useEffect(() => {
    const getBrand = async () => {
      try {
        const response = await api.get("/settings");
        const settings = response.data.data;
        const initials =
          settings.initials ||
          settings.restaurantName
            ?.split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((segment: string) => segment[0])
            .join("")
            .toUpperCase() ||
          "WP";

        setBrand({
          restaurantName: settings.restaurantName || "Warisoft POS",
          logoUrl: settings.logoUrl || "",
          initials,
        });
      } catch (error) {
        console.error("Failed to load sidebar brand:", error);
      }
    };

    const handleBrandUpdated = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          restaurantName?: string;
          logoUrl?: string;
          initials?: string;
        }>
      ).detail;
      const initials =
        detail.initials ||
        detail.restaurantName
          ?.split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((segment) => segment[0])
          .join("")
          .toUpperCase() ||
        "WP";

      setBrand({
        restaurantName: detail.restaurantName || "Warisoft POS",
        logoUrl: detail.logoUrl || "",
        initials,
      });
    };

    getBrand();
    window.addEventListener("settings-updated", handleBrandUpdated);

    return () => {
      window.removeEventListener("settings-updated", handleBrandUpdated);
    };
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: MdDashboard,
      roles: ["Manager", "Cashier", "Waiter", "Chef"],
    },
    {
      name: "New Order",
      path: "/neworder",
      icon: MdAddShoppingCart,
      roles: ["Manager", "Cashier", "Waiter"],
    },
    {
      name: "Orders",
      path: "/orders",
      icon: MdReceiptLong,
      roles: ["Manager", "Cashier", "Waiter", "Chef"],
    },
    {
      name: "Kitchen",
      path: "/kitchen",
      icon: MdKitchen,
      roles: ["Manager", "Chef"],
    },
    {
      name: "Tables",
      path: "/tables",
      icon: MdTableRestaurant,
      roles: ["Manager", "Cashier", "Waiter"],
    },
    {
      name: "Categories",
      path: "/categories",
      icon: MdCategory,
      roles: ["Manager"],
    },
    {
      name: "Menu",
      path: "/menu",
      icon: MdRestaurantMenu,
      roles: ["Manager", "Cashier", "Waiter", "Chef"],
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: MdInventory2,
      roles: ["Manager", "Chef"],
    },
    {
      name: "Customers",
      path: "/customers",
      icon: MdPeople,
      roles: ["Manager", "Cashier", "Waiter"],
    },
    {
      name: "Employees",
      path: "/employees",
      icon: MdBadge,
      roles: ["Manager"],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: MdSettings,
      roles: ["Manager"],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col overflow-hidden bg-[#221b18] text-white shadow-[0_10px_30px_rgba(18,13,11,0.18)]">
      <div className="shrink-0 border-b border-[#f0d9b6]/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,#f0d4a0_0%,#c18e52_100%)] text-xs font-bold text-[#1d140f] shadow-[0_6px_18px_rgba(193,142,82,0.22)]">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={`${brand.restaurantName} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              (brand.initials || "WP").slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-[0.04em] text-[#f8f2eb]">
              {brand.restaurantName}
            </h1>
          </div>
        </div>
      </div>

      <nav className="sidebar-scrollbar-hidden min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems
          .filter((item) => item.roles.includes(user?.role ?? ""))
          .map((item) => {
            const Icon = item.icon as IconType;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border border-[#f0d9b6]/15 bg-[#2d241f] text-[#f7e8d0] shadow-[inset_0_0_0_1px_rgba(240,217,182,0.06)]"
                      : "text-[#efe3d8] hover:bg-white/4 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      aria-hidden="true"
                      className={`mr-2.5 h-4 w-4 shrink-0 ${
                        isActive ? "text-[#f0d9b6]" : "text-[#a38d7c]"
                      }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
      </nav>

      <div className="shrink-0 border-t border-[#f0d9b6]/10 px-4 py-3">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#806d60] [text-shadow:1px_1px_0_#30251f,-1px_-1px_0_#17110f]">
          Powered by Warisoft
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
