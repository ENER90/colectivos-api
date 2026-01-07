# 🔌 Socket.io Events Documentation

## Authentication

All socket connections require JWT authentication via the `auth` object:

```javascript
const socket = io("http://localhost:3005", {
  auth: {
    token: "your_jwt_token_here"
  }
});
```

## Connection Events

### `connection`
Emitted when a client successfully connects and authenticates.

**Server Actions:**
- Sets user status to `online`
- Joins user to role-specific room (`drivers` or `passengers`)

---

## Driver Events

### 📤 Client → Server: `driver:location-update`

Update driver's current location and available seats.

**Payload:**
```typescript
{
  latitude: number;      // -90 to 90
  longitude: number;     // -180 to 180
  availableSeats?: number; // 0 to 4 (optional)
}
```

**Response (to sender):** `driver:location-update-success`
```typescript
{
  message: "Location updated successfully"
}
```

**Broadcast (to all passengers):** `driver:location-updated`
```typescript
{
  driverId: string;
  username: string;
  location: {
    latitude: number;
    longitude: number;
  };
  availableSeats: number;
  timestamp: Date;
}
```

---

### 📤 Client → Server: `driver:inactive`

Set driver status to inactive (not accepting passengers).

**Payload:** None

**Response:** `driver:inactive-success`
```typescript
{
  message: "Driver set to inactive"
}
```

---

## Passenger Events

### 📤 Client → Server: `passenger:waiting`

Mark passenger as waiting at a specific location.

**Payload:**
```typescript
{
  latitude: number;   // -90 to 90
  longitude: number;  // -180 to 180
}
```

**Response (to sender):** `passenger:waiting-success`
```typescript
{
  message: "Marked as waiting successfully";
  expiresAt: Date; // 15 minutes from now
}
```

**Broadcast (to all drivers):** `passenger:new-waiting`
```typescript
{
  passengerId: string;
  username: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}
```

---

### 📤 Client → Server: `passenger:cancel`

Cancel waiting status.

**Payload:** None

**Response (to sender):** `passenger:cancel-success`
```typescript
{
  message: "Waiting cancelled successfully"
}
```

**Broadcast (to all drivers):** `passenger:cancelled`
```typescript
{
  passengerId: string;
  timestamp: Date;
}
```

---

## Error Events

### 📥 Server → Client: `error`

Emitted when an error occurs during event processing.

**Payload:**
```typescript
{
  message: string;
}
```

**Common Error Messages:**
- `"Only drivers can update location"`
- `"Only passengers can mark as waiting"`
- `"Invalid location data"`
- `"Failed to update location"`
- `"Failed to mark as waiting"`

---

## Disconnect Event

### `disconnect`

Automatically triggered when client disconnects.

**Server Actions:**
- Sets user status to `offline`
- Sets driver to `inactive` (if driver)
- Sets passenger to `not waiting` (if passenger)

---

## Rooms

### `drivers`
All connected drivers are automatically joined to this room.

**Receives:**
- `passenger:new-waiting`
- `passenger:cancelled`

### `passengers`
All connected passengers are automatically joined to this room.

**Receives:**
- `driver:location-updated`

---

## Example Usage

### Driver Client

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3005", {
  auth: { token: driverToken }
});

// Update location every 5 seconds
setInterval(() => {
  socket.emit("driver:location-update", {
    latitude: -33.4500,
    longitude: -70.6500,
    availableSeats: 3
  });
}, 5000);

// Listen for new waiting passengers
socket.on("passenger:new-waiting", (data) => {
  console.log(`New passenger waiting: ${data.username}`);
  console.log(`Location: ${data.location.latitude}, ${data.location.longitude}`);
});

// Listen for cancelled passengers
socket.on("passenger:cancelled", (data) => {
  console.log(`Passenger ${data.passengerId} cancelled`);
});
```

### Passenger Client

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3005", {
  auth: { token: passengerToken }
});

// Mark as waiting
socket.emit("passenger:waiting", {
  latitude: -33.4500,
  longitude: -70.6500
});

// Listen for confirmation
socket.on("passenger:waiting-success", (data) => {
  console.log(`Waiting until: ${data.expiresAt}`);
});

// Listen for nearby drivers
socket.on("driver:location-updated", (data) => {
  console.log(`Driver ${data.username} nearby`);
  console.log(`Available seats: ${data.availableSeats}`);
  console.log(`Location: ${data.location.latitude}, ${data.location.longitude}`);
});

// Cancel waiting
socket.emit("passenger:cancel");
```

---

## Notes

- All location coordinates use **[longitude, latitude]** format in MongoDB (GeoJSON)
- All location coordinates use **{latitude, longitude}** format in Socket.io events
- Passenger waiting status expires after **15 minutes** (TTL index)
- Driver location updates should be sent every **3-5 seconds** for real-time tracking
- All timestamps are in ISO 8601 format
