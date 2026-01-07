// Configuración específica de la Ruta REAL: Alameda → San Bernardo
// Ruta: Alameda (Amunátegui) → Santo Domingo/Catedral → Manuel Rodríguez 
// → Ruta 5 Sur (llenos) o Gran Avenida (buscando pasajeros) → San Bernardo Centro

export interface RouteStop {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: "terminal" | "major" | "minor";
  description: string;
  routeType?: "autopista" | "calzada" | "both"; // Indica si está en ruta rápida o lenta
}

// Paraderos principales de la ruta real (ordenados de norte a sur)
export const ROUTE_STOPS: RouteStop[] = [
  // INICIO: Alameda
  {
    name: "Alameda con Amunátegui",
    coordinates: [-70.6640, -33.4450],
    type: "terminal",
    description: "Punto de partida - Alameda",
    routeType: "both",
  },
  {
    name: "Santo Domingo / Catedral",
    coordinates: [-70.6620, -33.4400],
    type: "major",
    description: "Cruce para tomar Manuel Rodríguez",
    routeType: "both",
  },
  {
    name: "Manuel Rodríguez (inicio)",
    coordinates: [-70.6610, -33.4480],
    type: "major",
    description: "Manuel Rodríguez hacia el sur",
    routeType: "both",
  },
  {
    name: "Manuel Rodríguez con Bascuñán Guerrero",
    coordinates: [-70.6590, -33.4620],
    type: "minor",
    description: "Manuel Rodríguez sur",
    routeType: "both",
  },
  
  // BIFURCACIÓN: Ruta 5 Sur (si van llenos)
  {
    name: "Entrada Ruta 5 Sur",
    coordinates: [-70.6650, -33.4850],
    type: "major",
    description: "Autopista - Solo si van llenos",
    routeType: "autopista",
  },
  {
    name: "Ruta 5 Sur - Salida Lo Espejo",
    coordinates: [-70.6750, -33.5200],
    type: "minor",
    description: "Primera salida hacia San Bernardo",
    routeType: "autopista",
  },
  {
    name: "Ruta 5 Sur - Salida San Bernardo",
    coordinates: [-70.6850, -33.5850],
    type: "major",
    description: "Salida principal San Bernardo",
    routeType: "autopista",
  },
  
  // RUTA ALTERNATIVA: Gran Avenida (si buscan pasajeros)
  {
    name: "Gran Avenida - La Cisterna",
    coordinates: [-70.6620, -33.5300],
    type: "major",
    description: "Gran Avenida (ruta lenta)",
    routeType: "calzada",
  },
  {
    name: "Gran Avenida - El Bosque",
    coordinates: [-70.6700, -33.5550],
    type: "minor",
    description: "Gran Avenida sur",
    routeType: "calzada",
  },
  {
    name: "Avenida Portales de la Reina",
    coordinates: [-70.6800, -33.5800],
    type: "major",
    description: "Entrada a San Bernardo",
    routeType: "calzada",
  },
  
  // DESTINO FINAL
  {
    name: "Centro de San Bernardo",
    coordinates: [-70.7000, -33.5950],
    type: "terminal",
    description: "Plaza de San Bernardo - Destino final",
    routeType: "both",
  },
];

// Límites del mapa (bounding box) para la ruta REAL
export const ROUTE_BOUNDS = {
  north: -33.43, // Alameda
  south: -33.61, // San Bernardo
  west: -70.71,
  east: -70.65,
};

// Centro del mapa (punto medio real de la ruta)
export const ROUTE_CENTER = {
  latitude: -33.52,
  longitude: -70.67,
};

// Distancia máxima permitida desde la ruta (en metros)
// Para validar que usuarios estén cerca de la ruta
export const MAX_DISTANCE_FROM_ROUTE = 2000; // 2km

// Configuración del mapa
export const MAP_CONFIG = {
  defaultZoom: 12,
  minZoom: 11,
  maxZoom: 16,
  center: [ROUTE_CENTER.latitude, ROUTE_CENTER.longitude] as [number, number],
  bounds: [
    [ROUTE_BOUNDS.south, ROUTE_BOUNDS.west],
    [ROUTE_BOUNDS.north, ROUTE_BOUNDS.east],
  ] as [[number, number], [number, number]],
};

// Información de la ruta REAL
export const ROUTE_INFO = {
  name: "Alameda - San Bernardo",
  code: "501", 
  distance: "18 km",
  durationFast: "25-30 min", // Por Ruta 5 (llenos)
  durationSlow: "40-50 min", // Por Gran Avenida (buscando pasajeros)
  viaFast: "Manuel Rodríguez → Ruta 5 Sur",
  viaSlow: "Manuel Rodríguez → Gran Avenida",
  fare: 800, // Tarifa aproximada en pesos chilenos
  capacity: 4, // 4 pasajeros por colectivo
  description: "Sale de Alameda por Amunátegui, dobla en Santo Domingo/Catedral, toma Manuel Rodríguez. Si va lleno → Ruta 5 Sur (rápido). Si busca pasajeros → Gran Avenida (lento).",
};

// Helper: Verificar si una ubicación está dentro de los límites de la ruta
export function isWithinRouteBounds(
  latitude: number,
  longitude: number
): boolean {
  return (
    latitude >= ROUTE_BOUNDS.south &&
    latitude <= ROUTE_BOUNDS.north &&
    longitude >= ROUTE_BOUNDS.west &&
    longitude <= ROUTE_BOUNDS.east
  );
}

// Helper: Obtener el paradero más cercano
export function getNearestStop(latitude: number, longitude: number): RouteStop {
  let nearest = ROUTE_STOPS[0];
  let minDistance = Infinity;

  for (const stop of ROUTE_STOPS) {
    const distance = calculateDistance(
      latitude,
      longitude,
      stop.coordinates[1],
      stop.coordinates[0]
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = stop;
    }
  }

  return nearest;
}

// Helper: Calcular distancia entre dos puntos (fórmula de Haversine simplificada)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
