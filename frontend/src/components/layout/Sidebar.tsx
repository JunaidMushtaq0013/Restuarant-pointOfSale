import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      roles: ["Manager", "Cashier", "Waiter", "Chef"],
    },
    {
      name: "New Order",
      path: "/neworder",
      roles: ["Manager", "Cashier", "Waiter"],
    },
    {
      name: "Orders",
      path: "/orders",
      roles: ["Manager", "Cashier", "Waiter", "Chef"],
    },
    {
      name: "Kitchen",
      path: "/kitchen",
      roles: ["Manager", "Chef"],
    },
    {
      name: "Tables",
      path: "/tables",
      roles: ["Manager", "Cashier", "Waiter"],
    },
    {
      name: "Categories",
      path: "/categories",
      roles: ["Manager"],
    },
    {
      name: "Menu",
      path: "/menu",
      roles: ["Manager", "Cashier", "Waiter", "Chef"],
    },
    {
      name: "Inventory",
      path: "/inventory",
      roles: ["Manager", "Chef"],
    },
    {
      name: "Customers",
      path: "/customers",
      roles: ["Manager", "Cashier", "Waiter"],
    },
    {
      name: "Employees",
      path: "/employees",
      roles: ["Manager"],
    },
    {
      name: "Settings",
      path: "/settings",
      roles: ["Manager"],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col overflow-hidden bg-slate-900 text-white">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-800 px-6 py-5">
        <h1 className="text-xl font-bold">
          Warisoft POS
        </h1>

        <p className="mt-1 text-xs text-slate-400">
          Restaurant Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navItems
          .filter((item) =>
            item.roles.includes(user?.role ?? ""),
          )
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-900"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
