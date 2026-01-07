#!/usr/bin/env node

/**
 * Socket.io Test Script
 * 
 * Tests real-time events for the Colectivos API
 * 
 * Usage:
 *   node test-socket.js <role> <token>
 * 
 * Examples:
 *   node test-socket.js driver eyJhbGc...
 *   node test-socket.js passenger eyJhbGc...
 */

const io = require("socket.io-client");

const role = process.argv[2];
const token = process.argv[3];

if (!role || !token) {
  console.error("❌ Usage: node test-socket.js <role> <token>");
  console.error("   role: 'driver' or 'passenger'");
  console.error("   token: JWT token from login");
  process.exit(1);
}

if (role !== "driver" && role !== "passenger") {
  console.error("❌ Role must be 'driver' or 'passenger'");
  process.exit(1);
}

const socket = io("http://localhost:3005", {
  auth: { token },
});

console.log(`🔌 Connecting as ${role}...`);

socket.on("connect", () => {
  console.log("✅ Connected to Socket.io server");
  console.log(`📡 Socket ID: ${socket.id}`);

  if (role === "driver") {
    testDriverEvents();
  } else {
    testPassengerEvents();
  }
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
  process.exit(1);
});

socket.on("error", (data) => {
  console.error("❌ Socket error:", data.message);
});

socket.on("disconnect", () => {
  console.log("🔌 Disconnected from server");
});

function testDriverEvents() {
  console.log("\n🚗 Testing Driver Events...\n");

  // Listen for new passengers
  socket.on("passenger:new-waiting", (data) => {
    console.log("📢 New passenger waiting:");
    console.log(`   Passenger: ${data.username} (${data.passengerId})`);
    console.log(`   Location: ${data.location.latitude}, ${data.location.longitude}`);
    console.log(`   Time: ${data.timestamp}`);
  });

  // Listen for cancelled passengers
  socket.on("passenger:cancelled", (data) => {
    console.log("📢 Passenger cancelled:");
    console.log(`   Passenger ID: ${data.passengerId}`);
    console.log(`   Time: ${data.timestamp}`);
  });

  // Update location every 5 seconds
  let lat = -33.4500;
  let lng = -70.6500;
  let seats = 4;

  console.log("📍 Starting location updates (every 5 seconds)...");
  console.log("   Press Ctrl+C to stop\n");

  const interval = setInterval(() => {
    lat += (Math.random() - 0.5) * 0.001;
    lng += (Math.random() - 0.5) * 0.001;

    socket.emit("driver:location-update", {
      latitude: lat,
      longitude: lng,
      availableSeats: seats,
    });

    console.log(`📍 Location updated: ${lat.toFixed(4)}, ${lng.toFixed(4)} | Seats: ${seats}`);
  }, 5000);

  socket.on("driver:location-update-success", (data) => {
    // Silent success
  });

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    clearInterval(interval);
    socket.emit("driver:inactive");
    console.log("\n🛑 Setting driver to inactive...");
    setTimeout(() => {
      socket.disconnect();
      process.exit(0);
    }, 500);
  });
}

function testPassengerEvents() {
  console.log("\n👤 Testing Passenger Events...\n");

  // Listen for nearby drivers
  socket.on("driver:location-updated", (data) => {
    console.log("📢 Driver location updated:");
    console.log(`   Driver: ${data.username} (${data.driverId})`);
    console.log(`   Location: ${data.location.latitude}, ${data.location.longitude}`);
    console.log(`   Available seats: ${data.availableSeats}`);
    console.log(`   Time: ${data.timestamp}`);
  });

  // Mark as waiting
  const lat = -33.4500 + (Math.random() - 0.5) * 0.01;
  const lng = -70.6500 + (Math.random() - 0.5) * 0.01;

  console.log(`📍 Marking as waiting at: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);

  socket.emit("passenger:waiting", {
    latitude: lat,
    longitude: lng,
  });

  socket.on("passenger:waiting-success", (data) => {
    console.log("✅ Marked as waiting successfully");
    console.log(`   Expires at: ${data.expiresAt}`);
    console.log("\n👂 Listening for nearby drivers...");
    console.log("   Press Ctrl+C to cancel waiting\n");
  });

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    socket.emit("passenger:cancel");
    console.log("\n🛑 Cancelling waiting status...");

    socket.on("passenger:cancel-success", (data) => {
      console.log("✅ Waiting cancelled");
      socket.disconnect();
      process.exit(0);
    });

    setTimeout(() => {
      socket.disconnect();
      process.exit(0);
    }, 1000);
  });
}
