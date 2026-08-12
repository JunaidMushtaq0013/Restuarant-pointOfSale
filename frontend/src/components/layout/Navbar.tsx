import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import api from "../../api/axious";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [restaurantName, setRestaurantName] = useState("Warisoft POS");

  useEffect(() => {
    const getRestaurantName = async () => {
      try {
        const response = await api.get("/settings");
        setRestaurantName(response.data.data.restaurantName || "Warisoft POS");
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

    return () => window.removeEventListener("settings-updated", handleSettingsUpdated);
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
      <div className="flex h-full items-center justify-between px-6">
        <h1 className="text-xl font-bold text-gray-800">
          {restaurantName}
        </h1>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-gray-800">
              {user?.name}
            </p>

            <p className="text-sm text-gray-500">
              {user?.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
