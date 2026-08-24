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

    return () => {
      window.removeEventListener("settings-updated", handleSettingsUpdated);
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
    <header className="sticky top-0 z-40 border-b border-[#e6d4bb] bg-[linear-gradient(135deg,#fffaf4_0%,#f8efe6_100%)] shadow-[0_8px_22px_rgba(61,37,24,0.06)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="shrink-0 rounded-xl border border-[#e5d3b3] bg-[#fffaf4] p-2 text-[#4f2d1d] transition hover:bg-[#f6ebdd] xl:hidden"
            aria-label="Open navigation menu"
          >
            <span className="text-xl">☰</span>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="hidden sm:block truncate text-lg font-semibold tracking-[0.04em] text-[#2a1d18] sm:text-xl">
              {restaurantName}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden rounded-full border-[0.5px] border-[#e5d3b3] bg-[#fffaf4] px-2 py-1 text-right sm:block">
            <p className="text-xs font-medium text-[#2a1d18]">{user?.name}</p>
            <p className="text-[10px] text-[#725a4f]">{user?.role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-[linear-gradient(135deg,#d9b06c_0%,#b58241_100%)] px-3 py-2 text-xs font-semibold text-[#2a1d18] shadow-[0_8px_18px_rgba(201,154,90,0.18)] transition hover:brightness-105 sm:px-4 sm:text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
