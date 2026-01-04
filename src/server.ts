import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { connectDB } from "./utils/database";

dotenv.config();

const PORT = process.env.PORT || 3005;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Colectivos API Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
