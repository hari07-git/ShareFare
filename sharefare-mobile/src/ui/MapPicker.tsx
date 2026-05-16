import React, { useEffect, useMemo, useRef } from "react";
import MapView, { LatLng, Marker, PROVIDER_DEFAULT, Region, UrlTile } from "react-native-maps";
import { View } from "react-native";
import { colors } from "../theme/colors";

export type Pin = { lat: number; lng: number };

function toRegion(center: Pin, zoomMeters = 2500): Region {
  // crude but fine for MVP
  const latDelta = zoomMeters / 111_000;
  const lngDelta = zoomMeters / (111_000 * Math.cos((center.lat * Math.PI) / 180));
  return {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: Math.max(0.002, latDelta),
    longitudeDelta: Math.max(0.002, lngDelta)
  };
}

export function MapPicker({
  value,
  onChange,
  center,
  height = 260,
  zoomMeters = 2500,
  readOnly = false
}: {
  value: Pin | null;
  onChange: (p: Pin) => void;
  center: Pin;
  height?: number;
  zoomMeters?: number;
  readOnly?: boolean;
}) {
  const mapRef = useRef<MapView | null>(null);
  const region = useMemo(() => toRegion(center, zoomMeters), [center.lat, center.lng, zoomMeters]);

  useEffect(() => {
    mapRef.current?.animateToRegion(region, 450);
  }, [region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta]);

  return (
    <View
      style={{
        height,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card
      }}
    >
      <MapView
        ref={(r) => {
          mapRef.current = r;
        }}
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={region}
        onPress={(e) => {
          if (readOnly) return;
          const p: LatLng = e.nativeEvent.coordinate;
          onChange({ lat: p.latitude, lng: p.longitude });
        }}
      >
        {/* OSM tiles */}
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        {value ? <Marker coordinate={{ latitude: value.lat, longitude: value.lng }} /> : null}
      </MapView>
    </View>
  );
}

