import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./protectedRoute";
import MainLayout from "../components/layout/MainLayout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Tables from "../pages/Tables/Tables";
import Inventory from "../pages/Inventory/Inventory";
import Customers from "../pages/Customer/customer";
import Categories from "../pages/Categories/Categories";
import Employees from "../pages/Employees/Employees";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Manager", "Cashier", "Waiter"]}
                />
              }
            >
              <Route path="/tables" element={<Tables />} />
            </Route>

            <Route
              element={<ProtectedRoute allowedRoles={["Manager", "Chef"]} />}
            >
              <Route path="/inventory" element={<Inventory />} />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Manager", "Cashier", "Waiter"]}
                />
              }
            >
              <Route path="/customers" element={<Customers />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["Manager"]} />}>
              <Route path="/categories" element={<Categories />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["Manager"]} />}>
              <Route path="/employees" element={<Employees />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
