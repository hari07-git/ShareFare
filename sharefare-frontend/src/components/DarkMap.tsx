import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { distanceKm, estimateEtaMinutes } from "../lib/route";

// Fix default marker icons in bundlers
// @ts-ignore
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// @ts-ignore
import markerIcon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ── Premium custom map pins ───────────────────────────────────────────────────

const PICKUP_PIN_HTML = `
<div style="position:relative;width:36px;height:46px;">
  <svg viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:46px;filter:drop-shadow(0 4px 12px rgba(99,102,241,0.45))">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 12.75 18 28 18 28s18-15.25 18-28C36 8.059 27.941 0 18 0z" fill="#4f46e5"/>
    <circle cx="18" cy="18" r="9" fill="white" opacity="0.95"/>
    <circle cx="18" cy="18" r="5" fill="#4f46e5"/>
  </svg>
</div>`;

const DROP_PIN_HTML = `
<div style="position:relative;width:36px;height:46px;">
  <svg viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:46px;filter:drop-shadow(0 4px 12px rgba(168,85,247,0.45))">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 12.75 18 28 18 28s18-15.25 18-28C36 8.059 27.941 0 18 0z" fill="#9333ea"/>
    <circle cx="18" cy="18" r="9" fill="white" opacity="0.95"/>
    <circle cx="18" cy="18" r="5" fill="#9333ea"/>
  </svg>
</div>`;

const NEARBY_PIN_HTML = `
<div style="width:14px;height:14px;border-radius:50%;background:#6366f1;border:2.5px solid white;box-shadow:0 0 0 4px rgba(99,102,241,0.18),0 2px 8px rgba(99,102,241,0.3)"></div>`;

const pickupIcon = L.divIcon({
  className: "",
  html: PICKUP_PIN_HTML,
  iconSize: [36, 46],
  iconAnchor: [18, 46]
});

const dropIcon = L.divIcon({
  className: "",
  html: DROP_PIN_HTML,
  iconSize: [36, 46],
  iconAnchor: [18, 46]
});

const nearbyIcon = L.divIcon({
  className: "",
  html: NEARBY_PIN_HTML,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// CartoDB Voyager — clean, modern, professional (NOT dark)
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

type LatLng = { lat: number; lng: number };

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  const hash = points.map((p) => `${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      // Single pin selected → fly smoothly to that location
      map.flyTo([points[0].lat, points[0].lng], 15, { animate: true, duration: 0.9 });
    } else {
      // Both pins → fit the full route in view
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p.lat, p.lng)));
      map.flyToBounds(bounds.pad(0.35), { animate: true, duration: 0.9 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, map]);
  return null;
}

function ClickToSet({ enabled, onClick }: { enabled: boolean; onClick: (p: LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      if (!enabled) return;
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function MovingCar({ route }: { route: LatLng[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (route.length < 2) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % route.length);
    }, 120);
    return () => clearInterval(interval);
  }, [route]);

  const carPoint = route[index];
  if (!carPoint) return null;

  const CAR_HTML = `
    <div style="font-size:24px; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transform:scaleX(-1); text-align:center;">
      🚗
    </div>
  `;
  const carIcon = L.divIcon({
    className: "sf-moving-car-pin",
    html: CAR_HTML,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return <Marker icon={carIcon} position={[carPoint.lat, carPoint.lng]} />;
}

export function DarkMap({
  pickup,
  drop,
  height = 560,
  clickTarget,
  onPick,
  nearby = []
}: {
  pickup: LatLng | null;
  drop: LatLng | null;
  height?: number;
  clickTarget?: "pickup" | "drop" | null;
  onPick?: (p: LatLng) => void;
  nearby?: LatLng[];
}) {
  const points = [pickup, drop].filter(Boolean) as LatLng[];
  const center = points[0] ?? { lat: 17.385, lng: 78.4867 };
  const [routePoints, setRoutePoints] = useState<LatLng[] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const route = pickup && drop ? (routePoints?.length ? routePoints : [pickup, drop]) : null;
  const distance = distanceKm(pickup, drop);
  const eta = estimateEtaMinutes(distance);

  useEffect(() => {
    let cancelled = false;
    async function loadRoadRoute() {
      setRoutePoints(null);
      if (!pickup || !drop) { setRouteLoading(false); return; }
      setRouteLoading(true);
      const coords = `${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("OSRM failed");
        const data = await res.json();
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(coordinates)) throw new Error("No route");
        const pts = coordinates
          .map((item: unknown) => {
            if (!Array.isArray(item)) return null;
            const [lng, lat] = item;
            return Number.isFinite(lat) && Number.isFinite(lng) ? { lat: Number(lat), lng: Number(lng) } : null;
          })
          .filter(Boolean) as LatLng[];
        if (!cancelled) setRoutePoints(pts.length > 1 ? pts : [pickup, drop]);
      } catch {
        if (!cancelled) setRoutePoints([pickup, drop]);
      } finally {
        if (!cancelled) setRouteLoading(false);
      }
    }
    void loadRoadRoute();
    return () => { cancelled = true; };
  }, [pickup?.lat, pickup?.lng, drop?.lat, drop?.lng]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height, width: "100%" }}
        className="sf-map-clean"
      >
        <MapResizer />
        <TileLayer attribution={TILE_ATTR} url={TILE_URL} />

        {pickup && <Marker icon={pickupIcon} position={[pickup.lat, pickup.lng]} />}
        {drop && <Marker icon={dropIcon} position={[drop.lat, drop.lng]} />}

        {nearby.map((point, i) => (
          <Marker
            key={`nb-${i}`}
            icon={nearbyIcon}
            position={[point.lat, point.lng]}
          />
        ))}

        {route && (
          <>
            {/* Shadow/halo line beneath */}
            <Polyline
              positions={route.map((p) => [p.lat, p.lng] as [number, number])}
              pathOptions={{ color: "#4f46e5", weight: 10, opacity: 0.12 }}
            />
            {/* Main route line */}
            <Polyline
              positions={route.map((p) => [p.lat, p.lng] as [number, number])}
              pathOptions={{ color: "#4f46e5", weight: 4, opacity: 0.9, dashArray: undefined }}
            />
            {/* Moving Car animation along the polyline! */}
            <MovingCar route={route} />
          </>
        )}

        <FitBounds points={points} />
        {clickTarget && onPick && <ClickToSet enabled={true} onClick={onPick} />}
      </MapContainer>

      {/* Top-left & Top-right premium floating overlays */}
      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2 z-[400] select-none">
        <span className="rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur">
          📍 Live route map
        </span>
        {pickup && drop && (
          <span className="rounded-full border border-emerald-200/50 bg-emerald-50/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-sm backdrop-blur flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Verified student route
          </span>
        )}
      </div>

      {route && !routeLoading && (
        <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-2 z-[400] select-none">
          <div className="rounded-2xl border border-white/40 bg-white/85 p-3 shadow-lg backdrop-blur-md flex flex-col gap-0.5 min-w-[110px] scale-90 sm:scale-100 origin-top-right">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Distance</span>
            <span className="text-sm font-extrabold text-slate-900">{distance?.toFixed(1)} km</span>
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/85 p-3 shadow-lg backdrop-blur-md flex flex-col gap-0.5 min-w-[110px] scale-90 sm:scale-100 origin-top-right">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">ETA</span>
            <span className="text-sm font-extrabold text-indigo-700">{eta} mins</span>
          </div>
        </div>
      )}

      {/* Click mode indicator */}
      {clickTarget && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[400]">
          <span className="rounded-full border border-amber-200 bg-amber-50/95 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
            {clickTarget === "pickup" ? "🟢 Click to set pickup pin" : "🟣 Click to set drop pin"}
          </span>
        </div>
      )}
    </div>
  );
}
