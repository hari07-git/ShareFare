import { useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { MapPicker } from "../components/MapPicker";
import { PageHeader } from "../components/PageHeader";
import { LocationAutocomplete } from "../components/LocationAutocomplete";

export function OfferRidePage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seatsTotal, setSeatsTotal] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState(50);
  const [originPin, setOriginPin] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationPin, setDestinationPin] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState<"o" | "d" | null>(null);

  function useMyLocation(which: "o" | "d") {
    if (!navigator.geolocation) {
      setError("Geolocation not supported in this browser.");
      return;
    }
    setGeoBusy(which);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (which === "o") setOriginPin(p);
        else setDestinationPin(p);
        setGeoBusy(null);
      },
      () => {
        setGeoBusy(null);
        setError("Unable to fetch your location. Please allow location permission.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/rides", {
        origin,
        destination,
        departureTime,
        seatsTotal,
        pricePerSeat,
        originLat: originPin?.lat ?? null,
        originLng: originPin?.lng ?? null,
        destinationLat: destinationPin?.lat ?? null,
        destinationLng: destinationPin?.lng ?? null
      });
      setOrigin("");
      setDestination("");
      setDepartureTime("");
      setSeatsTotal(3);
      setPricePerSeat(50);
      setOriginPin(null);
      setDestinationPin(null);
      setError("Ride offered successfully.");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to offer ride (ensure you registered as DRIVER)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Offer a ride"
        subtitle="Create a ride for your campus route. Add pickup/drop pins for clarity."
        imageUrl="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80"
      />
      <Card title="Offer a ride" subtitle="Add route details and pin pickup/drop on the map">
        <form className="space-y-4" onSubmit={submit}>
          <FormField label="Origin">
            <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Gachibowli" required />
          </FormField>
          <FormField label="Destination">
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Hitech City"
              required
            />
          </FormField>
          <FormField label="Departure time (ISO-8601 with offset)">
            <Input
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              placeholder="2030-01-01T10:00:00+05:30"
              required
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Total seats">
              <Input value={seatsTotal} onChange={(e) => setSeatsTotal(parseInt(e.target.value || "1", 10))} type="number" min={1} max={6} />
            </FormField>
            <FormField label="Price per seat (₹)">
              <Input value={pricePerSeat} onChange={(e) => setPricePerSeat(parseFloat(e.target.value || "0"))} type="number" min={0} step="0.5" />
            </FormField>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium text-slate-700">Pickup pin (click on map)</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={geoBusy !== null}
                  onClick={() => useMyLocation("o")}
                >
                  {geoBusy === "o" ? "Locating..." : "Use my location"}
                </Button>
              </div>
            </div>
            <LocationAutocomplete
              value={origin}
              onValue={setOrigin}
              placeholder="Type pickup (area/college)…"
              disabled={geoBusy !== null}
              onSelect={(place) => setOriginPin({ lat: place.lat, lng: place.lng })}
            />
            <MapPicker
              value={originPin}
              onChange={setOriginPin}
              center={originPin ?? { lat: 17.385, lng: 78.4867 }}
              zoom={originPin ? 15 : 12}
            />
            {originPin ? (
              <div className="text-xs text-slate-600">
                Lat: {originPin.lat.toFixed(6)} • Lng: {originPin.lng.toFixed(6)}
              </div>
            ) : (
              <div className="text-xs text-slate-600">Optional but recommended.</div>
            )}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium text-slate-700">Drop pin (click on map)</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={geoBusy !== null}
                  onClick={() => useMyLocation("d")}
                >
                  {geoBusy === "d" ? "Locating..." : "Use my location"}
                </Button>
              </div>
            </div>
            <LocationAutocomplete
              value={destination}
              onValue={setDestination}
              placeholder="Type drop (area/college)…"
              disabled={geoBusy !== null}
              onSelect={(place) => setDestinationPin({ lat: place.lat, lng: place.lng })}
            />
            <MapPicker
              value={destinationPin}
              onChange={setDestinationPin}
              center={destinationPin ?? { lat: 17.385, lng: 78.4867 }}
              zoom={destinationPin ? 15 : 12}
            />
            {destinationPin ? (
              <div className="text-xs text-slate-600">
                Lat: {destinationPin.lat.toFixed(6)} • Lng: {destinationPin.lng.toFixed(6)}
              </div>
            ) : null}
          </div>
          {error ? <div className="text-sm text-slate-700">{error}</div> : null}
          <Button disabled={busy} type="submit">
            {busy ? "Submitting..." : "Offer ride"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
