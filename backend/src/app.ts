import express from "express";
import cors from "cors";
import categoryRoutes from "./features/category/category.routes.js";
import inventoryRoutes from "./features/inventory/inventory.routes.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";

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



app.use(globalErrorHandler);
export default app;