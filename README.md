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
POST   /api/passengers/waiting    - Mark as waiting (auth)
GET    /api/passengers/nearby     - Get nearby waiting passengers (auth, driver)
DELETE /api/passengers/cancel     - Cancel waiting status (auth)
```

### Drivers

```
PUT    /api/drivers/location      - Update location (auth, driver)
PUT    /api/drivers/seats         - Update available seats (auth, driver)
GET    /api/drivers/status        - Get driver status (auth)
```

## 🔌 WebSocket Events

### Client → Server

- `passenger:waiting` - Passenger marks as waiting
- `driver:location` - Driver updates location
- `driver:seats` - Driver updates available seats

### Server → Client

- `passengers:update` - New passenger waiting nearby
- `passenger:picked_up` - Passenger was picked up
- `driver:nearby` - Driver approaching

## 📖 License

MIT
