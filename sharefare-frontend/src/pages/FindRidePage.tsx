import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { DarkMap } from "../components/DarkMap";
import { GradientButton } from "../components/GradientButton";
import { NoRidesEmpty } from "../components/NoRidesEmpty";
import { RideCardSkeleton } from "../components/Skeletons";
import { PlaceResult, searchPlaces } from "../lib/geocode";
import { distanceKm, estimateEtaMinutes } from "../lib/route";
import { Calendar, CarFront, Clock3, MapPin, Navigation, Search, SlidersHorizontal, Star, Users } from "lucide-react";
import { motion } from "framer-motion";

type Ride = {
  id: number;
  origin: string;
  destination: string;
  departureTime: string;
  seatsAvailable: number;
  pricePerSeat: number;
  driverName: string;
  driverGender: string;
  driverTrustScore: number;
  femalePreferred: boolean;
  verifiedOnly: boolean;
  safetyLevel: string | null;
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

const fallbackPickup = { lat: 17.4448, lng: 78.3498 };
const fallbackDrop = { lat: 17.4483, lng: 78.3915 };

export function FindRidePage() {
  const [sp] = useSearchParams();
  const [origin, setOrigin] = useState(sp.get("origin") ?? "");
  const [destination, setDestination] = useState(sp.get("destination") ?? "");
  const [date, setDate] = useState(sp.get("date") ?? "");
  const [femaleOnly, setFemaleOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [originPlace, setOriginPlace] = useState<PlaceResult | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<PlaceResult | null>(null);
  const [appliedPage, setAppliedPage] = useState(0);
  const [searchTick, setSearchTick] = useState(0);
  const [data, setData] = useState<Page<Ride> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeRide, setActiveRide] = useState<RideDetails | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [manualPickup, setManualPickup] = useState<{ lat: number; lng: number } | null>(null);
  const [manualDrop, setManualDrop] = useState<{ lat: number; lng: number } | null>(null);
  const [pinTarget, setPinTarget] = useState<"pickup" | "drop" | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = { page: appliedPage, size: 20 };
    if (origin.trim()) p.origin = origin.trim();
    if (destination.trim()) p.destination = destination.trim();
    if (date) p.date = date;
    if (femaleOnly) p.femaleOnly = true;
    if (verifiedOnly) p.verifiedOnly = true;
    return p;
  }, [origin, destination, date, appliedPage, femaleOnly, verifiedOnly]);

  const pickup =
    activeRide?.originLat && activeRide?.originLng
      ? { lat: activeRide.originLat, lng: activeRide.originLng }
      : manualPickup ?? (originPlace ? { lat: originPlace.lat, lng: originPlace.lng } : null);
  const drop =
    activeRide?.destinationLat && activeRide?.destinationLng
      ? { lat: activeRide.destinationLat, lng: activeRide.destinationLng }
      : manualDrop ?? (destinationPlace ? { lat: destinationPlace.lat, lng: destinationPlace.lng } : null);
  const previewPickup = pickup ?? fallbackPickup;
  const previewDrop = drop ?? fallbackDrop;
  // Use fallbacks ONLY for displaying distance/ETA stats, never for the map
  const statsPickup = pickup ?? fallbackPickup;
  const statsDrop = drop ?? fallbackDrop;
  const distance = distanceKm(statsPickup, statsDrop);
  const eta = estimateEtaMinutes(distance);


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

  async function hydratePinsFromText() {
    const [fromResults, toResults] = await Promise.all([
      origin.trim() && !originPlace ? searchPlaces(origin.trim()) : Promise.resolve([]),
      destination.trim() && !destinationPlace ? searchPlaces(destination.trim()) : Promise.resolve([])
    ]);
    if (fromResults[0]) {
      setOriginPlace(fromResults[0]);
      setManualPickup({ lat: fromResults[0].lat, lng: fromResults[0].lng });
    }
    if (toResults[0]) {
      setDestinationPlace(toResults[0]);
      setManualDrop({ lat: toResults[0].lat, lng: toResults[0].lng });
    }
  }

  function applySearch() {
    setAppliedPage(0);
    setActiveRide(null);
    setActiveId(null);
    void hydratePinsFromText();
    setSearchTick((value) => value + 1);
  }

  async function loadRideDetails(id: number) {
    setActiveId(id);
    try {
      const res = await api.get<RideDetails>(`/api/rides/${id}`);
      setActiveRide(res.data);
    } catch {
      setActiveRide(null);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTick, appliedPage]);

  useEffect(() => {
    if (origin || destination) void hydratePinsFromText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nearby = useMemo(
    () => [
      { lat: 17.437, lng: 78.366 },
      { lat: 17.456, lng: 78.382 },
      { lat: 17.432, lng: 78.392 },
      { lat: 17.462, lng: 78.352 }
    ],
    []
  );

  return (
    <div>
      <section className="mb-5 grid gap-5 lg:grid-cols-[minmax(340px,460px)_1fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  <Search className="h-3.5 w-3.5" />
                  Live ride search
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Find a ride</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Search Hyderabad routes, preview student pickup pins, and book from a map-first ride list.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <LocationAutocomplete
                value={origin}
                onValue={(value) => {
                  setOrigin(value);
                  setOriginPlace(null);
                  setManualPickup(null);
                }}
                placeholder="From: college, metro, area..."
                onSelect={(place) => {
                  setOriginPlace(place);
                  setManualPickup({ lat: place.lat, lng: place.lng });
                  setOrigin(place.displayName);
                }}
              />
              <LocationAutocomplete
                value={destination}
                onValue={(value) => {
                  setDestination(value);
                  setDestinationPlace(null);
                  setManualDrop(null);
                }}
                placeholder="To: HITEC City, JNTU, Gachibowli..."
                onSelect={(place) => {
                  setDestinationPlace(place);
                  setManualDrop({ lat: place.lat, lng: place.lng });
                  setDestination(place.displayName);
                }}
              />
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                    <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="pl-10" />
                  </div>
                  <GradientButton onClick={applySearch} className="min-w-32">
                    Search <Search className="h-4 w-4" />
                  </GradientButton>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="font-medium">Verified Students Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={femaleOnly} onChange={e => setFemaleOnly(e.target.checked)} className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                  <span className="font-medium text-purple-700">Female Commuters Only</span>
                </label>
              </div>
            </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-slate-950">Available rides</div>
                <div className="mt-1 text-xs text-slate-500">
                  {data ? `${data.totalElements} matches` : "Searching routes"}
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Best match
              </div>
            </div>
            {error ? <div className="mb-3 text-sm text-rose-600">{error}</div> : null}
            {busy && !data ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <RideCardSkeleton key={index} />
                ))}
              </div>
            ) : null}
            {data && data.content.length === 0 ? (
              <NoRidesEmpty
                onClear={() => {
                  setOrigin("");
                  setDestination("");
                  setDate("");
                  setOriginPlace(null);
                  setDestinationPlace(null);
                  setManualPickup(null);
                  setManualDrop(null);
                  setAppliedPage(0);
                  setSearchTick((value) => value + 1);
                }}
              />
            ) : null}
            <div className="space-y-3">
              {data?.content.map((ride, index) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onMouseEnter={() => void loadRideDetails(ride.id)}
                  onClick={() => void loadRideDetails(ride.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition duration-200 ${
                    activeId === ride.id ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm overflow-hidden">
                        {ride.driverGender === 'FEMALE' ? '👩‍🎓' : 'SF'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">{ride.driverName}</span>
                          {ride.driverGender === 'FEMALE' && <span className="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">Female</span>}
                          {ride.driverTrustScore > 5 && <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Trusted</span>}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span className="truncate">{ride.origin}</span>
                        </div>
                        <div className="ml-1.5 h-5 border-l border-dashed border-slate-200" />
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                          <span className="truncate">{ride.destination}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-slate-950">₹{ride.pricePerSeat}</div>
                      <div className="text-xs text-slate-500">per seat</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {new Date(ride.departureTime).toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {ride.seatsAvailable} seats left</span>
                    <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-300" /> 4.9</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-indigo-600">Tap to focus route</span>
                    <Link to={`/rides/${ride.id}`}>
                      <GradientButton className="py-2" variant="primary">Details</GradientButton>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            {data ? (
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>Page {data.number + 1} / {Math.max(1, data.totalPages)}</span>
                <div className="flex gap-2">
                  <Button variant="secondary" disabled={data.number <= 0} onClick={() => setAppliedPage((value) => Math.max(0, value - 1))}>Prev</Button>
                  <Button variant="secondary" disabled={data.number + 1 >= data.totalPages} onClick={() => setAppliedPage((value) => value + 1)}>Next</Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
          <DarkMap
            pickup={pickup}
            drop={drop}
            nearby={nearby}
            height={typeof window === "undefined" ? 560 : Math.min(620, Math.max(380, window.innerHeight - 250))}
            clickTarget={pinTarget}
            onPick={(point) => {
              if (pinTarget === "pickup") {
                setManualPickup(point);
                setOriginPlace(null);
              }
              if (pinTarget === "drop") {
                setManualDrop(point);
                setDestinationPlace(null);
              }
            }}
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <MapPin className="h-4 w-4 text-indigo-500" />
              <div className="mt-2 text-xl font-semibold text-slate-950">{distance?.toFixed(1)} km</div>
              <div className="text-xs text-slate-500">route distance</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <Clock3 className="h-4 w-4 text-indigo-500" />
              <div className="mt-2 text-xl font-semibold text-slate-950">{eta} min</div>
              <div className="text-xs text-slate-500">estimated ETA</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <CarFront className="h-4 w-4 text-indigo-500" />
              <div className="mt-2 text-xl font-semibold text-slate-950">{data?.totalElements ?? 0}</div>
              <div className="text-xs text-slate-500">rides found</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant={pinTarget === "pickup" ? "primary" : "secondary"} onClick={() => setPinTarget((value) => (value === "pickup" ? null : "pickup"))}>
              Pickup pin
            </Button>
            <Button variant={pinTarget === "drop" ? "primary" : "secondary"} onClick={() => setPinTarget((value) => (value === "drop" ? null : "drop"))}>
              Drop pin
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setManualPickup(null);
                setManualDrop(null);
                setOriginPlace(null);
                setDestinationPlace(null);
                setActiveRide(null);
                setActiveId(null);
              }}
            >
              Clear pins
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
