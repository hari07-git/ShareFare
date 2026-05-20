import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import * as L from "leaflet";
import React from "react";

// Fix default marker icon paths
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconRetinaUrl: marker2x, iconUrl: marker, shadowUrl: shadow });

// Premium custom pin
const CUSTOM_PIN_HTML = `
<div style="position:relative;width:32px;height:42px;">
  <svg viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:42px;filter:drop-shadow(0 3px 10px rgba(99,102,241,0.45))">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 12.75 18 28 18 28s18-15.25 18-28C36 8.059 27.941 0 18 0z" fill="#4f46e5"/>
    <circle cx="18" cy="18" r="9" fill="white" opacity="0.95"/>
    <circle cx="18" cy="18" r="5" fill="#4f46e5"/>
  </svg>
</div>`;

const customIcon = L.divIcon({
  className: "",
  html: CUSTOM_PIN_HTML,
  iconSize: [32, 42],
  iconAnchor: [16, 42]
});

const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

type LatLng = { lat: number; lng: number };

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }); }
  });
  return null;
}

function Recenter({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, zoom]);
  return null;
}

export function MapPicker({
  value,
  onChange,
  height = 280,
  center = { lat: 17.385, lng: 78.4867 },
  zoom = 12,
  readOnly = false
}: {
  value: LatLng | null;
  onChange: (p: LatLng) => void;
  height?: number;
  center?: LatLng;
  zoom?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height, width: "100%" }}
        scrollWheelZoom
        className="sf-map-clean"
      >
        <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
        <Recenter center={center} zoom={zoom} />
        {!readOnly && <ClickHandler onPick={onChange} />}
        {value && <Marker icon={customIcon} position={[value.lat, value.lng]} />}
      </MapContainer>
      {!readOnly && (
        <div className="pointer-events-none absolute bottom-3 inset-x-3 z-[400]">
          <span className="rounded-full border border-indigo-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
            📍 Click on the map to set pin
          </span>
        </div>
      )}
    </div>
  );
}
