import React, { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { ScreenShell } from "./_shared";
import { colors } from "../../theme/colors";
import { LocationAutocomplete } from "../../ui/LocationAutocomplete";
import { MapPicker, Pin } from "../../ui/MapPicker";
import { PrimaryButton } from "../../ui/PrimaryButton";
import * as Location from "expo-location";
import { useAuth } from "../../state/auth";
import { apiFetch } from "../../api/client";
import { TextField } from "../../ui/TextField";

export function OfferRideScreen() {
  const { token } = useAuth();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seatsTotal, setSeatsTotal] = useState("3");
  const [pricePerSeat, setPricePerSeat] = useState("50");
  const [originPin, setOriginPin] = useState<Pin | null>(null);
  const [destinationPin, setDestinationPin] = useState<Pin | null>(null);
  const [busy, setBusy] = useState(false);

  const originCenter = useMemo(() => originPin ?? { lat: 17.385, lng: 78.4867 }, [originPin]);
  const destCenter = useMemo(() => destinationPin ?? { lat: 17.385, lng: 78.4867 }, [destinationPin]);

  async function useMyLocation(which: "o" | "d") {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Location", "Permission denied.");
      return;
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    if (which === "o") setOriginPin(p);
    else setDestinationPin(p);
  }

  async function submit() {
    if (!token) {
      Alert.alert("Login required", "Please login first.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/rides", {
        method: "POST",
        token,
        body: JSON.stringify({
          origin,
          destination,
          departureTime,
          seatsTotal: Number(seatsTotal || 0),
          pricePerSeat: Number(pricePerSeat || 0),
          originLat: originPin?.lat ?? null,
          originLng: originPin?.lng ?? null,
          destinationLat: destinationPin?.lat ?? null,
          destinationLng: destinationPin?.lng ?? null
        })
      });
      Alert.alert("Ride offered", "Your ride is live.");
      setOrigin("");
      setDestination("");
      setDepartureTime("");
      setSeatsTotal("3");
      setPricePerSeat("50");
      setOriginPin(null);
      setDestinationPin(null);
    } catch (e: any) {
      Alert.alert("Offer failed", e?.message ?? "Ensure you registered as DRIVER");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenShell title="Offer Ride" subtitle="Offer a ride as DRIVER. Pin pickup/drop on map.">
      <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
        <LocationAutocomplete
          label="Pickup (type area/college)"
          value={origin}
          onValue={setOrigin}
          placeholder="e.g., Gachibowli"
          disabled={busy}
          onSelect={(place) => setOriginPin({ lat: place.lat, lng: place.lng })}
        />
        <PrimaryButton title="Use my location (pickup)" onPress={() => void useMyLocation("o")} disabled={busy} />
        <MapPicker value={originPin} onChange={setOriginPin} center={originCenter} height={220} zoomMeters={1800} />

        <LocationAutocomplete
          label="Drop (type area/college)"
          value={destination}
          onValue={setDestination}
          placeholder="e.g., Hitech City"
          disabled={busy}
          onSelect={(place) => setDestinationPin({ lat: place.lat, lng: place.lng })}
        />
        <PrimaryButton title="Use my location (drop)" onPress={() => void useMyLocation("d")} disabled={busy} />
        <MapPicker value={destinationPin} onChange={setDestinationPin} center={destCenter} height={220} zoomMeters={1800} />

        <Text style={{ color: colors.muted, fontSize: 12 }}>
          Departure time format matches backend (example): 2030-01-01T10:00:00+05:30
        </Text>
        <TextField
          label="Departure time"
          value={departureTime}
          onChangeText={setDepartureTime}
          placeholder="2030-01-01T10:00:00+05:30"
          autoCapitalize="none"
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Seats"
              value={seatsTotal}
              onChangeText={setSeatsTotal}
              placeholder="3"
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Price/seat (₹)"
              value={pricePerSeat}
              onChangeText={setPricePerSeat}
              placeholder="50"
              keyboardType="numeric"
              autoCapitalize="none"
            />
          </View>
        </View>

        <PrimaryButton title={busy ? "Submitting..." : "Offer ride"} onPress={() => void submit()} disabled={busy} />
      </View>
    </ScreenShell>
  );
}
