# Colectivos API

Backend de coordinación en tiempo real para taxis colectivos en Chile. Conecta pasajeros y conductores para reducir viajes en vacío.

**Stack:** Node.js · Express · TypeScript · MongoDB (geo) · Socket.io · JWT · Docker  
**Frontend:** [colectivos-app](https://github.com/ENER90/colectivos-app)

> Portfolio project — geospatial queries, roles pasajero/conductor y eventos WebSocket.

## Highlights

- Auth JWT con roles passenger / driver
- Broadcast de ubicación de pasajeros en espera
- Consultas geoespaciales de pasajeros cercanos
- Estado del conductor y asientos disponibles
- Eventos Socket.io para notificaciones instantáneas

## Architecture

```
colectivos-app (web/mobile)
        ↓  REST + Socket.io
   Express + Socket.io
        ↓
  Auth · Passenger · Driver handlers
        ↓
 MongoDB + geospatial indexes
```

## Quick start

```bash
git clone https://github.com/ENER90/colectivos-api.git
cd colectivos-api
npm install
cp .env.example .env
docker-compose up -d mongodb
npm run dev
```

Server: `http://localhost:3005`

## REST endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                         (auth)
```

### Passengers
```
POST   /api/passengers/waiting              (auth, passenger)
DELETE /api/passengers/waiting              (auth, passenger)
```

### Drivers
```
GET    /api/drivers/nearby-passengers       (auth, driver)
PUT    /api/drivers/status                  (auth, driver)
```

## WebSocket events

Detalle completo en [SOCKET_EVENTS.md](./SOCKET_EVENTS.md).

**Driver:** `driver:location-update`, `driver:inactive`
**Passenger:** `passenger:waiting`, `passenger:cancel`
**Broadcast:** `driver:location-updated`, `passenger:new-waiting`, `passenger:cancelled`

## Author

[René Del Valle Rodríguez](https://github.com/ENER90) · [LinkedIn](https://www.linkedin.com/in/rendelvalle)

## License

MIT
GET    /api/drivers/nearby-passengers       (auth, driver)
PUT    /api/drivers/status                  (auth, driver)
```
