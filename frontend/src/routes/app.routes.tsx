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
import Menu from "../pages/Menu/Menu";
import Kitchen from "../pages/Kitchen/Kitchen";
import Settings from "../pages/Settings/Settings";
import Orders from "../pages/Orders/Orders";
import NewOrder from "../pages/neworder/NewOrder";
import DigitalMenu from "../pages/DigitalMenu/DigitalMenu";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/digital-menu" element={<DigitalMenu />} />

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
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Manager", "Cashier", "Waiter", "Chef"]}
                />
              }
            >
              <Route path="/menu" element={<Menu />} />
            </Route>

            <Route
              element={<ProtectedRoute allowedRoles={["Manager", "Chef"]} />}
            >
              <Route path="/kitchen" element={<Kitchen />} />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Manager", "Cashier", "Waiter", "Chef"]}
                />
              }
            >
              <Route path="/orders" element={<Orders />} />
            </Route>

              <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Manager", "Cashier", "Waiter", "Chef"]}
                />
              }
            >
              <Route path="/neworder" element={<NewOrder />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
