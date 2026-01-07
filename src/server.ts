import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { connectDB } from "./utils/database";
import { initializeSocketIO } from "./sockets/socket.handler";

dotenv.config();

const PORT = process.env.PORT || 3005;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);

    const io = initializeSocketIO(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Colectivos API Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔌 Socket.io initialized and ready`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
