// Configuración específica de la Ruta Mapocho-Alameda-San Bernardo
// Esta es la ruta principal que cubre ~20km desde el centro hacia el sur

export interface RouteStop {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: "terminal" | "major" | "minor";
  description: string;
}

// Paraderos principales de la ruta (de norte a sur)
export const ROUTE_STOPS: RouteStop[] = [
  {
    name: "Estación Mapocho",
    coordinates: [-70.6567, -33.4269],
    type: "terminal",
    description: "Terminal norte - Estación Mapocho",
  },
  {
    name: "Plaza Italia",
    coordinates: [-70.6399, -33.4372],
    type: "major",
    description: "Plaza Baquedano / Plaza Italia",
  },
  {
    name: "República",
    coordinates: [-70.6529, -33.4500],
    type: "major",
    description: "Alameda con República",
  },
  {
    name: "Estación Central",
    coordinates: [-70.6783, -33.4569],
    type: "major",
    description: "Estación Central de Trenes",
  },
  {
    name: "Lo Ovalle",
    coordinates: [-70.6850, -33.4750],
    type: "major",
    description: "Entrada Autopista Central",
  },
  {
    name: "Gran Avenida",
    coordinates: [-70.6830, -33.5100],
    type: "major",
    description: "Gran Avenida - San Miguel",
  },
  {
    name: "El Parrón",
    coordinates: [-70.6900, -33.5400],
    type: "major",
    description: "El Parrón - La Cisterna",
  },
  {
    name: "La Portada",
    coordinates: [-70.6950, -33.5700],
    type: "major",
    description: "La Portada - San Bernardo",
  },
  {
    name: "Plaza San Bernardo",
    coordinates: [-70.7000, -33.5950],
    type: "terminal",
    description: "Terminal sur - Plaza de San Bernardo",
  },
];

// Límites del mapa (bounding box) para la ruta
export const ROUTE_BOUNDS = {
  north: -33.42, // Un poco al norte de Mapocho
  south: -33.62, // Un poco al sur de San Bernardo
  west: -70.75,
  east: -70.62,
};

// Centro del mapa (punto medio aproximado)
export const ROUTE_CENTER = {
  latitude: -33.51,
  longitude: -70.68,
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

// Información de la ruta
export const ROUTE_INFO = {
  name: "Mapocho - Alameda - San Bernardo",
  code: "501", // Código típico de colectivos en esta ruta
  distance: "20 km",
  duration: "30-45 min",
  via: "Alameda, Autopista Central",
  fare: 800, // Tarifa aproximada en pesos chilenos
  capacity: 4, // Típicamente 4 pasajeros por colectivo
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
