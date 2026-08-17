import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../api/axious";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const [restaurantName, setRestaurantName] = useState("Warisoft POS");

  useEffect(() => {
    const getRestaurantName = async () => {
      try {
        const response = await api.get("/settings");

        setRestaurantName(
          response.data.data.restaurantName || "Warisoft POS",
        );
      } catch (error) {
        console.error("Failed to load restaurant name:", error);
      }
    };

    const handleSettingsUpdated = (event: Event) => {
      const { restaurantName: updatedName } = (
        event as CustomEvent<{ restaurantName: string }>
      ).detail;

      setRestaurantName(updatedName || "Warisoft POS");
    };

    getRestaurantName();

    window.addEventListener("settings-updated", handleSettingsUpdated);

    return () => {
      window.removeEventListener(
        "settings-updated",
        handleSettingsUpdated,
      );
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
    } catch {
      toast.error("Logout failed.");
    }
  };

  return (
    <header className="h-16 border-b bg-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left Side */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Hamburger */}
          <button
            onClick={onMenuClick}
            className="shrink-0 rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 xl:hidden"
            aria-label="Open navigation menu"
          >
            <span className="text-xl">☰</span>
          </button>

          {/* Restaurant Name */}
          <h1 className="truncate text-lg font-bold text-gray-800 sm:text-xl">
            {restaurantName}
          </h1>
        </div>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* User Info */}
          <div className="hidden text-right sm:block">
            <p className="font-medium text-gray-800">
              {user?.name}
            </p>

            <p className="text-sm text-gray-500">
              {user?.role}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-600 sm:px-4 sm:text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;