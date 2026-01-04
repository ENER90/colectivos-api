import mongoose from "mongoose";

const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  maxConnecting: 2,
  retryWrites: true,
  family: 4,
};

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb://admin:password123@localhost:27020/colectivos-db?authSource=admin";

    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoURI, mongooseOptions);

    console.log("🍃 MongoDB connected successfully");
    console.log(`📍 Database: ${mongoose.connection.db?.databaseName}`);
    console.log(
      `🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("🔗 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ Mongoose connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 Mongoose disconnected from MongoDB");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 Mongoose reconnected to MongoDB");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 Mongoose connection closed due to app termination");
  process.exit(0);
});
