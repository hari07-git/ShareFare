import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import * as L from "leaflet";
import React from "react";

// Fix default marker icon paths when bundling
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow
});

type LatLng = { lat: number; lng: number };

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

function Recenter({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  // Keep the map centered when props change (MapContainer doesn't fully react to updates)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
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
    <div className="overflow-hidden rounded-xl border">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height, width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} zoom={zoom} />
        {readOnly ? null : <ClickHandler onPick={onChange} />}
        {value ? <Marker position={[value.lat, value.lng]} /> : null}
      </MapContainer>
    </div>
  );
}
