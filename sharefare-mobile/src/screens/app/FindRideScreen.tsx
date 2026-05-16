import React, { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { ScreenShell } from "./_shared";
import { colors } from "../../theme/colors";
import { LocationAutocomplete } from "../../ui/LocationAutocomplete";
import { MapPicker, Pin } from "../../ui/MapPicker";
import { reverseGeocode } from "../../lib/geocode";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../state/auth";

export function FindRideScreen() {
  const { token } = useAuth();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originPin, setOriginPin] = useState<Pin | null>(null);
  const [destinationPin, setDestinationPin] = useState<Pin | null>(null);
  const [busy, setBusy] = useState<"o" | "d" | null>(null);
  const [searchBusy, setSearchBusy] = useState(false);
  const [results, setResults] = useState<
    { id: number; origin: string; destination: string; departureTime: string; seatsAvailable: number; pricePerSeat: string }[]
  >([]);

  const originCenter = useMemo(() => originPin ?? { lat: 17.385, lng: 78.4867 }, [originPin]);
  const destCenter = useMemo(() => destinationPin ?? { lat: 17.385, lng: 78.4867 }, [destinationPin]);

  async function pick(which: "o" | "d", p: Pin) {
    setBusy(which);
    if (which === "o") setOriginPin(p);
    else setDestinationPin(p);
    const name = await reverseGeocode(p.lat, p.lng);
    if (name) {
      if (which === "o") setOrigin(name);
      else setDestination(name);
    } else {
      if (which === "o" && !origin.trim()) setOrigin(`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`);
      if (which === "d" && !destination.trim()) setDestination(`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`);
    }
    setBusy(null);
  }

  async function runSearch() {
    setSearchBusy(true);
    try {
      const params = new URLSearchParams();
      if (origin.trim()) params.set("origin", origin.trim());
      if (destination.trim()) params.set("destination", destination.trim());
      const data: any = await apiFetch(`/api/rides/search?${params.toString()}`, { method: "GET" });
      const content = Array.isArray(data?.content) ? data.content : [];
      setResults(
        content.map((r: any) => ({
          id: Number(r?.id),
          origin: String(r?.origin ?? ""),
          destination: String(r?.destination ?? ""),
          departureTime: String(r?.departureTime ?? ""),
          seatsAvailable: Number(r?.seatsAvailable ?? 0),
          pricePerSeat: String(r?.pricePerSeat ?? "")
        }))
      );
    } catch (e: any) {
      Alert.alert("Search failed", e?.message ?? "Try again");
    } finally {
      setSearchBusy(false);
    }
  }

  async function bookRide(rideId: number) {
    if (!token) {
      Alert.alert("Login required", "Login to book rides.");
      return;
    }
    try {
      await apiFetch(`/api/rides/${rideId}/bookings`, {
        method: "POST",
        token,
        body: JSON.stringify({ seats: 1 })
      });
      Alert.alert("Booked", "Booking created.");
    } catch (e: any) {
      Alert.alert("Booking failed", e?.message ?? "Try again");
    }
  }

  return (
    <ScreenShell title="Find Ride" subtitle="Search rides by source/destination + optional map pins.">
      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
        <LocationAutocomplete
          label="Source"
          value={origin}
          onValue={setOrigin}
          placeholder="Type area / college…"
          disabled={busy !== null}
          onSelect={(place) => setOriginPin({ lat: place.lat, lng: place.lng })}
        />
        <MapPicker value={originPin} onChange={(p) => void pick("o", p)} center={originCenter} height={220} zoomMeters={1800} />

        <LocationAutocomplete
          label="Destination"
          value={destination}
          onValue={setDestination}
          placeholder="Type area / college…"
          disabled={busy !== null}
          onSelect={(place) => setDestinationPin({ lat: place.lat, lng: place.lng })}
        />
        <MapPicker value={destinationPin} onChange={(p) => void pick("d", p)} center={destCenter} height={220} zoomMeters={1800} />

        <PrimaryButton title={searchBusy ? "Searching..." : "Search rides"} onPress={() => void runSearch()} disabled={searchBusy} />

        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: colors.card2, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.border, gap: 6 }}>
              <Text style={{ color: colors.text, fontWeight: "800" }} numberOfLines={1}>
                {item.origin} → {item.destination}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                {item.departureTime}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                Seats: {item.seatsAvailable} • ₹{item.pricePerSeat}
              </Text>
              <Pressable
                onPress={() => void bookRide(item.id)}
                style={({ pressed }) => ({
                  marginTop: 4,
                  backgroundColor: pressed ? "rgba(62,214,192,0.75)" : colors.primary2,
                  paddingVertical: 10,
                  borderRadius: 14
                })}
              >
                <Text style={{ textAlign: "center", fontWeight: "800", color: "#071017" }}>Book (1 seat)</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </ScreenShell>
  );
}
