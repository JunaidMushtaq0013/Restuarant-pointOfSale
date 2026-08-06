import express from "express";
import cors from "cors";
import categoryRoutes from "./features/category/category.routes.js";
import inventoryRoutes from "./features/inventory/inventory.routes.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import menuRoutes from "./features/menu/menu.routes.js";
import customerRoutes from "./features/customer/customer.routes.js";
import orderRoutes from "./features/orders/orders.routes.js";

const app = express();

app.use(cors());


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


app.use(globalErrorHandler);
export default app;