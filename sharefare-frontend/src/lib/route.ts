export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceKm(a: LatLng | null, b: LatLng | null) {
  if (!a || !b) return null;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function estimateEtaMinutes(distance: number | null) {
  if (distance === null) return null;
  return Math.max(8, Math.round((distance / 28) * 60));
}

export function estimateFare(distance: number | null, seats = 1) {
  if (distance === null) return null;
  return Math.max(35, Math.round((32 + distance * 8) / Math.max(1, seats)));
}
