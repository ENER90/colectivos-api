# 🚖 Colectivos API

Real-time coordination backend for taxi colectivos in Chile. Connects passengers and drivers to reduce empty trips and increase efficiency.

## 🚀 Stack

- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose** (Geospatial queries)
- **Socket.io** (Real-time communication)
- **JWT** (Authentication)
- **Docker** (MongoDB)

## ✨ Features

- User authentication (passenger/driver)
- Real-time passenger location broadcasting
- Geospatial queries for nearby passengers
- Driver status and available seats tracking
- WebSocket events for instant notifications

## 🛠️ Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start MongoDB with Docker
docker-compose up -d mongodb

# Run in development
npm run dev
```

Server runs on `http://localhost:3005`

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register    - Register user (passenger/driver)
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get profile (auth)
```

### Passengers

```
POST   /api/passengers/waiting    - Mark as waiting (auth, passenger)
DELETE /api/passengers/waiting    - Cancel waiting status (auth, passenger)
```

### Drivers

```
GET    /api/drivers/nearby-passengers  - Get nearby waiting passengers (auth, driver)
PUT    /api/drivers/status             - Update location & status (auth, driver)
```

## 🔌 WebSocket Events

Real-time communication via Socket.io. See [SOCKET_EVENTS.md](./SOCKET_EVENTS.md) for detailed documentation.

### Driver Events

- `driver:location-update` → Update location & available seats
- `driver:inactive` → Set driver as inactive

### Passenger Events

- `passenger:waiting` → Mark as waiting at location
- `passenger:cancel` → Cancel waiting status

### Broadcast Events

- `driver:location-updated` → Broadcast to all passengers
- `passenger:new-waiting` → Broadcast to all drivers
- `passenger:cancelled` → Broadcast to all drivers

## 📖 License

MIT
