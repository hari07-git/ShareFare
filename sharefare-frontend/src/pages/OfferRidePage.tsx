import { useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { DarkMap } from "../components/DarkMap";
import { GradientButton } from "../components/GradientButton";
import { BadgeIndianRupee, CalendarClock, Lightbulb, MapPin, Phone, ShieldCheck } from "lucide-react";

export function OfferRidePage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seatsTotal, setSeatsTotal] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState(50);
  const [contactPhone, setContactPhone] = useState("");
  const [originPin, setOriginPin] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationPin, setDestinationPin] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState<"o" | "d" | null>(null);
  const [pinTarget, setPinTarget] = useState<"pickup" | "drop" | null>("pickup");

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
      if (contactPhone.trim()) {
        // Save/refresh driver phone so riders can contact after booking.
        const me = await api.get("/api/me");
        await api.put("/api/me", {
          fullName: me.data.fullName,
          phone: contactPhone.trim(),
          collegeId: me.data.collegeId
        });
      }
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
      setContactPhone("");
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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-cyan-500/15 shadow-[0_60px_160px_-120px_rgba(2,6,23,0.9)]">
        <div className="px-6 py-7 md:px-10">
          <div className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Offer a ride</div>
          <div className="mt-1 text-sm text-slate-100/80">
            Plan your route, pin pickup + drop, and publish your ride for Hyderabad commuters.
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <Card title="Route details" subtitle="Accurate location search + contact phone">
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Pickup</div>
                <LocationAutocomplete
                  value={origin}
                  onValue={setOrigin}
                  placeholder="Where are you leaving from?"
                  disabled={geoBusy !== null}
                  onSelect={(place) => setOriginPin({ lat: place.lat, lng: place.lng })}
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Drop</div>
                <LocationAutocomplete
                  value={destination}
                  onValue={setDestination}
                  placeholder="Where are you going?"
                  disabled={geoBusy !== null}
                  onSelect={(place) => setDestinationPin({ lat: place.lat, lng: place.lng })}
                />
              </div>

              <FormField label="Departure time (ISO-8601 with offset)">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <Input
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="pl-11"
                    placeholder="2030-01-01T10:00:00+05:30"
                    required
                  />
                </div>
              </FormField>

              <FormField label="Contact phone (shared after booking)">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="pl-11" placeholder="+91 9XXXXXXXXX" />
                </div>
              </FormField>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Total seats">
                  <Input value={seatsTotal} onChange={(e) => setSeatsTotal(parseInt(e.target.value || "1", 10))} type="number" min={1} max={6} />
                </FormField>
                <FormField label="Price per seat (₹)">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <BadgeIndianRupee className="h-4 w-4" />
                    </span>
                    <Input value={pricePerSeat} onChange={(e) => setPricePerSeat(parseFloat(e.target.value || "0"))} className="pl-11" type="number" min={0} step="0.5" />
                  </div>
                </FormField>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={geoBusy !== null}
                  onClick={() => useMyLocation("o")}
                >
                  {geoBusy === "o" ? "Locating pickup…" : "Use my location (pickup)"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={geoBusy !== null}
                  onClick={() => useMyLocation("d")}
                >
                  {geoBusy === "d" ? "Locating drop…" : "Use my location (drop)"}
                </Button>
              </div>

              {error ? <div className="text-sm text-rose-300">{error}</div> : null}
              <GradientButton disabled={busy} type="submit" className="w-full">
                {busy ? "Publishing…" : "Offer ride"}
              </GradientButton>
            </form>
          </Card>

          <Card title="Pro tips" subtitle="Make your ride fill faster">
            <div className="space-y-3 text-sm text-slate-200/90">
              <div className="flex gap-3">
                <Lightbulb className="mt-0.5 h-5 w-5 text-cyan-300" />
                <div>Pin exact pickup & drop points so riders meet you easily.</div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                <div>Add your phone number — it appears only after booking.</div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-indigo-300" />
                <div>Keep origin/destination short and recognizable (college/area).</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <Card title="Route planner" subtitle="Dark map + neon route. Click map to drop pins.">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-300/90">
                Click the map to set {pinTarget ?? "a pin"}.
              </div>
              <div className="flex gap-2">
                <Button variant={pinTarget === "pickup" ? "primary" : "secondary"} type="button" onClick={() => setPinTarget("pickup")}>
                  Pickup
                </Button>
                <Button variant={pinTarget === "drop" ? "primary" : "secondary"} type="button" onClick={() => setPinTarget("drop")}>
                  Drop
                </Button>
                <Button variant="secondary" type="button" onClick={() => { setOriginPin(null); setDestinationPin(null); }}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <DarkMap
                pickup={originPin}
                drop={destinationPin}
                height={650}
                clickTarget={pinTarget}
                onPick={(p) => {
                  if (pinTarget === "pickup") setOriginPin(p);
                  else if (pinTarget === "drop") setDestinationPin(p);
                }}
              />
            </div>
          </Card>

          <Card title="Earnings preview" subtitle="A quick estimate (platform fee shown for transparency)">
            {(() => {
              const total = (Number.isFinite(pricePerSeat) ? pricePerSeat : 0) * (Number.isFinite(seatsTotal) ? seatsTotal : 0);
              const fee = total * 0.05;
              const receive = total - fee;
              return (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-300/80">Estimated earnings</div>
                    <div className="mt-2 text-3xl font-semibold text-white">₹{total.toFixed(0)}</div>
                    <div className="mt-1 text-xs text-slate-300/80">
                      Based on {seatsTotal} seat(s) × ₹{pricePerSeat}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-300/80">Platform fee (5%)</div>
                    <div className="mt-2 text-3xl font-semibold text-rose-200">-₹{fee.toFixed(0)}</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-slate-300/80">You’ll receive</div>
                    <div className="mt-2 text-3xl font-semibold text-emerald-200">₹{receive.toFixed(0)}</div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      </div>
    </div>
  );
}
