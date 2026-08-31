import { Server } from "socket.io";
import { env } from "./config/env.js";

let io: Server;

export const initializeSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
};