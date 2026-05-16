import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix default marker icons in bundlers
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markerIcon from "leaflet/dist/images/marker-icon.png";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

type LatLng = { lat: number; lng: number };

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p.lat, p.lng)));
    map.fitBounds(bounds.pad(0.25), { animate: true, duration: 0.5 });
  }, [points, map]);
  return null;
}

function ClickToSet({
  enabled,
  onClick
}: {
  enabled: boolean;
  onClick: (p: LatLng) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (!enabled) return;
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

export function DarkMap({
  pickup,
  drop,
  height = 560,
  clickTarget,
  onPick
}: {
  pickup: LatLng | null;
  drop: LatLng | null;
  height?: number;
  clickTarget?: "pickup" | "drop" | null;
  onPick?: (p: LatLng) => void;
}) {
  const points = [pickup, drop].filter(Boolean) as LatLng[];
  const center = points[0] ?? { lat: 17.385, lng: 78.4867 };
  const route = pickup && drop ? [pickup, drop] : null;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height }}
        className="sf-map-dark"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {pickup ? <Marker position={[pickup.lat, pickup.lng]} /> : null}
        {drop ? <Marker position={[drop.lat, drop.lng]} /> : null}
        {route ? (
          <Polyline
            positions={route.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: "#22d3ee", weight: 5, opacity: 0.9 }}
          />
        ) : null}
        <FitBounds points={points} />
        {clickTarget && onPick ? (
          <ClickToSet enabled={true} onClick={onPick} />
        ) : null}
      </MapContainer>
    </div>
  );
}

