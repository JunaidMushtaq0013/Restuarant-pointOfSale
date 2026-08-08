import express from "express";
import cors from "cors";
import categoryRoutes from "./features/category/category.routes.js";
import inventoryRoutes from "./features/inventory/inventory.routes.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import menuRoutes from "./features/menu/menu.routes.js";
import customerRoutes from "./features/customer/customer.routes.js";
import orderRoutes from "./features/orders/orders.routes.js";
import settingsRoutes from "./features/settings/settings.routes.js";
import employeeRoutes from "./features/employee/employee.routes.js";
import authRoutes from "./features/auth/auth.routes.js";
import cookieParser from "cookie-parser";
import tableRoutes from "./features/tables/tables.routes.js";
import dashboardRoutes from "./features/dashboard/dashboard.routes.js";


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());



app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Warisoft POS API is running",
  });
});


app.use("/api/categories", categoryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings",settingsRoutes);
app.use("/api/employees",employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.use(globalErrorHandler);
export default app;