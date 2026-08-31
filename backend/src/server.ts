import http from "http";

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/database.js";
import { initializeSocket } from "./socket.js";

const startServer = async () => {
  await connectDatabase();

  const server = http.createServer(app);

  initializeSocket(server);

  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is running on port ${env.PORT}`);
  });
};

startServer();