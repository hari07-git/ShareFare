import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CarFront, Clock3, Route, ShieldCheck } from "lucide-react";

type LatLng = { lat: number; lng: number };

// ── Premium pin SVGs ──────────────────────────────────────────────────────────

const PICKUP_PIN = `<div style="position:relative;width:32px;height:42px;"><svg viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:42px;filter:drop-shadow(0 3px 8px rgba(99,102,241,0.4))"><path d="M18 0C8.059 0 0 8.059 0 18c0 12.75 18 28 18 28s18-15.25 18-28C36 8.059 27.941 0 18 0z" fill="#4f46e5"/><circle cx="18" cy="18" r="9" fill="white" opacity="0.95"/><circle cx="18" cy="18" r="5" fill="#4f46e5"/></svg></div>`;

const DROP_PIN = `<div style="position:relative;width:32px;height:42px;"><svg viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:42px;filter:drop-shadow(0 3px 8px rgba(168,85,247,0.4))"><path d="M18 0C8.059 0 0 8.059 0 18c0 12.75 18 28 18 28s18-15.25 18-28C36 8.059 27.941 0 18 0z" fill="#9333ea"/><circle cx="18" cy="18" r="9" fill="white" opacity="0.95"/><circle cx="18" cy="18" r="5" fill="#9333ea"/></svg></div>`;

const DRIVER_PIN = `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#4f46e5);border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 14px rgba(99,102,241,0.5),0 0 0 6px rgba(99,102,241,0.12)">🚗</div>`;

const pickupIcon = L.divIcon({ className: "", html: PICKUP_PIN, iconSize: [32, 42], iconAnchor: [16, 42] });
const dropIcon = L.divIcon({ className: "", html: DROP_PIN, iconSize: [32, 42], iconAnchor: [16, 42] });
const driverIcon = L.divIcon({ className: "", html: DRIVER_PIN, iconSize: [40, 40], iconAnchor: [20, 20] });

const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function FitRoute({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.flyTo([points[0].lat, points[0].lng], 15, { animate: true, duration: 0.6 });
    } else {
      map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])).pad(0.28), {
        animate: true,
        duration: 0.5
      });
    }
  }, [map, points]);
  return null;
}

async function fetchRoadRoute(pickup: LatLng, drop: LatLng) {
  const coords = `${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}`;
  const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
  if (!res.ok) throw new Error("Route unavailable");
  const data = await res.json();
  const coordinates = data?.routes?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coordinates)) throw new Error("Route unavailable");
  return coordinates
    .map((item: unknown) => {
      if (!Array.isArray(item)) return null;
      const [lng, lat] = item;
      return Number.isFinite(lat) && Number.isFinite(lng) ? { lat: Number(lat), lng: Number(lng) } : null;
    })
    .filter(Boolean) as LatLng[];
}

export function LiveRideTracker({
  pickup,
  drop,
  active = false
}: {
  pickup: LatLng | null;
  drop: LatLng | null;
  active?: boolean;
}) {
  const [routePoints, setRoutePoints] = useState<LatLng[]>([]);
  const [progressIndex, setProgressIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!pickup || !drop) { setRoutePoints([]); return; }
      try {
        const pts = await fetchRoadRoute(pickup, drop);
        if (!cancelled) setRoutePoints(pts.length > 1 ? pts : [pickup, drop]);
      } catch {
        if (!cancelled) setRoutePoints([pickup, drop]);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [pickup?.lat, pickup?.lng, drop?.lat, drop?.lng]);

  useEffect(() => {
    if (!active || routePoints.length < 2) return;
    const id = window.setInterval(() => {
      setProgressIndex((cur) => Math.min(routePoints.length - 1, cur + Math.max(1, Math.floor(routePoints.length / 36))));
    }, 1600);
    return () => window.clearInterval(id);
  }, [active, routePoints.length]);

  useEffect(() => { setProgressIndex(0); }, [routePoints]);

  const driverPoint = routePoints[Math.min(progressIndex, Math.max(0, routePoints.length - 1))] ?? pickup;
  const progress = routePoints.length > 1 ? Math.round((progressIndex / (routePoints.length - 1)) * 100) : 0;
  const eta = Math.max(0, Math.ceil((100 - progress) / 6));
  const status = progress >= 100 ? "Arrived! 🎉" : progress > 12 ? "En route" : active ? "Driver arriving" : "Ready";
  const statusColor = progress >= 100 ? "bg-emerald-50 text-emerald-700" : progress > 12 ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700";

  const visiblePoints = useMemo(
    () => (routePoints.length > 1 ? routePoints : [pickup, drop].filter(Boolean) as LatLng[]),
    [routePoints, pickup, drop]
  );

  // Already-travelled segment
  const travelledPoints = useMemo(
    () => routePoints.slice(0, progressIndex + 1),
    [routePoints, progressIndex]
  );
  const remainingPoints = useMemo(
    () => routePoints.slice(progressIndex),
    [routePoints, progressIndex]
  );

  if (!pickup || !drop) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Route className="h-5 w-5 text-slate-400" />
        </div>
        <div className="text-sm text-slate-500">Live tracking appears when pickup and drop pins are set.</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
            <CarFront className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-950">Live route preview</div>
            <div className="mt-0.5 text-xs text-slate-500">Simulated driver movement along real roads</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>{status}</span>
          {active && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Map */}
      <MapContainer
        center={[pickup.lat, pickup.lng]}
        zoom={13}
        style={{ height: 320 }}
        className="sf-map-clean"
      >
        <TileLayer attribution={TILE_ATTR} url={TILE_URL} />

        <Marker icon={pickupIcon} position={[pickup.lat, pickup.lng]} />
        <Marker icon={dropIcon} position={[drop.lat, drop.lng]} />
        {driverPoint && <Marker icon={driverIcon} position={[driverPoint.lat, driverPoint.lng]} />}

        {/* Remaining route — indigo solid */}
        {remainingPoints.length > 1 && (
          <Polyline
            positions={remainingPoints.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: "#4f46e5", weight: 5, opacity: 0.85 }}
          />
        )}

        {/* Travelled — grey dashed */}
        {travelledPoints.length > 1 && (
          <Polyline
            positions={travelledPoints.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: "#94a3b8", weight: 4, opacity: 0.5, dashArray: "6 8" }}
          />
        )}

        <FitRoute points={visiblePoints} />
      </MapContainer>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          { icon: Clock3, label: "ETA remaining", value: `${eta} min`, color: "text-indigo-600", bg: "bg-indigo-50" },
          { icon: Route, label: "Route progress", value: `${progress}%`, color: "text-violet-600", bg: "bg-violet-50" },
          { icon: ShieldCheck, label: "Driver status", value: status, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="mt-2 text-sm font-bold text-slate-950 truncate">{value}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
