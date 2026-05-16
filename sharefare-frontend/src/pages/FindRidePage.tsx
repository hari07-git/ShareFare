import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { DarkMap } from "../components/DarkMap";
import { searchPlaces } from "../lib/geocode";
import { GradientButton } from "../components/GradientButton";
import { Calendar, MapPin, Navigation, Search, SlidersHorizontal } from "lucide-react";

type Ride = {
  id: number;
  origin: string;
  destination: string;
  departureTime: string;
  seatsAvailable: number;
  pricePerSeat: number;
};

type RideDetails = {
  id: number;
  driverEmail: string;
  driverName: string;
  driverPhone: string | null;
  origin: string;
  destination: string;
  originLat: number | null;
  originLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
  departureTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  pricePerSeat: number;
  status: string;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export function FindRidePage() {
  const [sp] = useSearchParams();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(0); // UI page selection
  const [appliedPage, setAppliedPage] = useState(0); // page used for the last "Find"
  const [searchTick, setSearchTick] = useState(0); // increments when user hits "Find"/"Clear"
  const [data, setData] = useState<Page<Ride> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeRide, setActiveRide] = useState<RideDetails | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [pickupPin, setPickupPin] = useState<{ lat: number; lng: number } | null>(null);
  const [dropPin, setDropPin] = useState<{ lat: number; lng: number } | null>(null);
  const [pinTarget, setPinTarget] = useState<"pickup" | "drop" | null>(null);
  const [pinBusy, setPinBusy] = useState<"o" | "d" | null>(null);
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropQuery, setDropQuery] = useState("");

  useEffect(() => {
    const o = sp.get("origin");
    const d = sp.get("destination");
    const dt = sp.get("date");
    if (o && !origin) setOrigin(o);
    if (d && !destination) setDestination(d);
    if (dt && !date) setDate(dt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const params = useMemo(() => {
    const p: any = { page: appliedPage, size: 20 };
    if (origin.trim()) p.origin = origin.trim();
    if (destination.trim()) p.destination = destination.trim();
    if (date) p.date = date;
    return p;
  }, [origin, destination, date, appliedPage]);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.get<Page<Ride>>("/api/rides/search", { params });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load rides");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTick, appliedPage]);

  async function loadRideDetails(id: number) {
    setActiveId(id);
    try {
      const res = await api.get<RideDetails>(`/api/rides/${id}`);
      setActiveRide(res.data);
    } catch {
      // ignore
    }
  }

  async function searchAndPin(which: "o" | "d") {
    const q = (which === "o" ? pickupQuery : dropQuery).trim();
    if (!q) return;
    setPinBusy(which);
    const res = await searchPlaces(q);
    const first = res[0];
    if (first) {
      const p = { lat: first.lat, lng: first.lng };
      if (which === "o") {
        setPickupPin(p);
        setPickupQuery(first.displayName);
        setOrigin(first.displayName);
      } else {
        setDropPin(p);
        setDropQuery(first.displayName);
        setDestination(first.displayName);
      }
      setPage(0);
    }
    setPinBusy(null);
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-cyan-500/15 shadow-[0_60px_160px_-120px_rgba(2,6,23,0.9)]">
        <div className="px-6 py-7 md:px-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Find a ride
              </div>
              <div className="mt-1 text-sm text-slate-100/80">
                Hyderabad-first search • premium map + live suggestions
              </div>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <GradientButton variant="ghost" onClick={() => setSearchTick((t) => t + 1)}>
                Refresh
              </GradientButton>
              <GradientButton onClick={() => {
                setPage(0);
                setAppliedPage(0);
                setSearchTick((t) => t + 1);
              }}>
                <Search className="h-4 w-4" /> Search
              </GradientButton>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <Input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="pl-11"
                  placeholder="From (area/college)…"
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Navigation className="h-4 w-4" />
                </div>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-11"
                  placeholder="To (area/college)…"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-11" />
              </div>
            </div>
            <div className="md:col-span-1">
              <GradientButton
                className="w-full"
                onClick={() => {
                  setPage(0);
                  setAppliedPage(0);
                  setSearchTick((t) => t + 1);
                }}
              >
                <Search className="h-4 w-4" />
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <Card
            title="Map filter"
            subtitle="Search locations, then pin pickup + drop (auto zooms to your place)"
          >
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Pickup</div>
                  <div className="flex gap-2">
                    <div className="w-full">
                      <LocationAutocomplete
                        value={pickupQuery}
                        onValue={setPickupQuery}
                        placeholder="Type pickup (area/college)…"
                        disabled={pinBusy !== null}
                        onSelect={(p) => {
                          setPickupPin({ lat: p.lat, lng: p.lng });
                          setPickupQuery(p.displayName);
                          setOrigin(p.displayName);
                          setPage(0);
                        }}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={!pickupQuery.trim() || pinBusy !== null}
                      onClick={() => void searchAndPin("o")}
                    >
                      Search
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Drop</div>
                  <div className="flex gap-2">
                    <div className="w-full">
                      <LocationAutocomplete
                        value={dropQuery}
                        onValue={setDropQuery}
                        placeholder="Type drop (area/college)…"
                        disabled={pinBusy !== null}
                        onSelect={(p) => {
                          setDropPin({ lat: p.lat, lng: p.lng });
                          setDropQuery(p.displayName);
                          setDestination(p.displayName);
                          setPage(0);
                        }}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={!dropQuery.trim() || pinBusy !== null}
                      onClick={() => void searchAndPin("d")}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-xs text-slate-300/90">
                  <SlidersHorizontal className="h-4 w-4" />
                  Click on the map to drop a pin (pickup or drop).
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={pinTarget === "pickup" ? "primary" : "secondary"}
                    type="button"
                    onClick={() => setPinTarget((v) => (v === "pickup" ? null : "pickup"))}
                  >
                    Pickup
                  </Button>
                  <Button
                    variant={pinTarget === "drop" ? "primary" : "secondary"}
                    type="button"
                    onClick={() => setPinTarget((v) => (v === "drop" ? null : "drop"))}
                  >
                    Drop
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setPickupPin(null);
                      setDropPin(null);
                      setPinTarget(null);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Available rides" subtitle="Select a ride to preview pins on the map">
            {error ? <div className="mb-3 text-sm text-rose-300">{error}</div> : null}
            {busy && !data ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : null}
            {data && data.content.length === 0 ? (
              <div className="text-sm text-slate-300/90">No rides found. Try a nearby area like Gachibowli.</div>
            ) : null}

            <div className="space-y-3">
              {data?.content.map((r) => (
                <div
                  key={r.id}
                  onMouseEnter={() => void loadRideDetails(r.id)}
                  className={`group rounded-3xl border p-4 transition ${
                    activeId === r.id
                      ? "border-cyan-300/30 bg-white/10 shadow-[0_25px_80px_-60px_rgba(34,211,238,0.5)]"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {r.origin} → {r.destination}
                      </div>
                      <div className="mt-1 text-xs text-slate-300/90">
                        {new Date(r.departureTime).toLocaleString()} • {r.seatsAvailable} seats left
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-white">₹{r.pricePerSeat}</div>
                      <div className="mt-1 text-xs text-slate-300/80">per seat</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-300/80">
                      Hover to preview pins • Click for details
                    </div>
                    <Link to={`/rides/${r.id}`}>
                      <GradientButton className="py-2" variant="primary">
                        Book now
                      </GradientButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {data ? (
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-slate-300/90">
                  Page {data.number + 1} / {Math.max(1, data.totalPages)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={data.number <= 0}
                    onClick={() => {
                      setPage((p) => Math.max(0, p - 1));
                      setAppliedPage((p) => Math.max(0, p - 1));
                    }}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={data.number + 1 >= data.totalPages}
                    onClick={() => {
                      setPage((p) => p + 1);
                      setAppliedPage((p) => p + 1);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card
            title="Live map"
            subtitle="Dark map + neon route highlight. Pins auto-zoom; ride preview shows driver pins."
          >
            <div className="grid gap-4">
              <DarkMap
                pickup={
                  activeRide?.originLat && activeRide?.originLng
                    ? { lat: activeRide.originLat, lng: activeRide.originLng }
                    : pickupPin
                }
                drop={
                  activeRide?.destinationLat && activeRide?.destinationLng
                    ? { lat: activeRide.destinationLat, lng: activeRide.destinationLng }
                    : dropPin
                }
                height={620}
                clickTarget={pinTarget}
                onPick={(p) => {
                  if (pinTarget === "pickup") {
                    setPickupPin(p);
                    setPage(0);
                  } else if (pinTarget === "drop") {
                    setDropPin(p);
                    setPage(0);
                  }
                }}
              />

              {activeRide ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-white">
                      Previewing ride #{activeRide.id}
                    </div>
                    <div className="text-xs text-slate-300/90">
                      Driver: {activeRide.driverName}
                      {activeRide.driverPhone ? ` • ${activeRide.driverPhone}` : ""}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-300/90">
                    Route: {activeRide.origin} → {activeRide.destination}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-300/90">
                  Tip: hover a ride card to preview driver pins on the map.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
