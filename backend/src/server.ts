import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/database.js";

const startServer = async () => {
  await connectDatabase();

app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${env.PORT}`);
  });
};

startServer();