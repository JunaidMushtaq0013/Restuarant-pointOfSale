import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Desktop Sidebar */}
      <div className="hidden xl:block">
        <Sidebar />
      </div>

      {/* Mobile / Tablet / Medium Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="relative h-full w-64 border-r border-[#5d392c]/40 bg-[linear-gradient(180deg,#2f1d18_0%,#1d120f_100%)] shadow-2xl">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />

            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-[#f6d9a7] transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="xl:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1600px] rounded-[26px] border border-[#ebdcc6] bg-[linear-gradient(180deg,rgba(255,255,255,0.56)_0%,rgba(247,239,230,0.78)_100%)] p-3 shadow-[0_12px_24px_rgba(61,37,24,0.05)] sm:p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
