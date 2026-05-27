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
  driverCollegeName?: string | null;
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
  const [mapHeight, setMapHeight] = useState(500);

  useEffect(() => {
    const handleResize = () => {
      setMapHeight(window.innerWidth < 640 ? 300 : Math.min(620, Math.max(380, window.innerHeight - 250)));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <section className="mb-5 grid gap-5 lg:grid-cols-[minmax(0,460px)_1fr]">
        <div className="flex flex-col gap-5">
          <div className="lg:sticky lg:top-24 lg:z-30 bg-white lg:bg-white/95 lg:backdrop-blur-md rounded-2xl border border-slate-200 p-3 sm:p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  <Search className="h-3.5 w-3.5" />
                  Live ride search
                </div>
                <h1 className="mt-1 sm:mt-4 text-xl sm:text-3xl font-bold tracking-tight text-slate-950">Find a ride</h1>
                <p className="hidden sm:block mt-2 text-sm leading-6 text-slate-600">
                  Search Hyderabad routes, preview student pickup pins, and book from a map-first ride list.
                </p>
              </div>
            </div>

            <div className="mt-3 sm:mt-5 space-y-2">
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
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-indigo-500" />
                  <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="pl-9 py-2 sm:py-1.5 text-xs sm:text-sm" />
                </div>
                <GradientButton onClick={applySearch} className="w-full text-sm sm:text-xs py-2 sm:py-1.5 px-3">
                  Search <Search className="h-3.5 w-3.5" />
                </GradientButton>
              </div>
            </div>
            
            <div className="pt-3 mt-3 border-t border-slate-100 flex flex-row flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" />
                <span className="font-semibold text-slate-650">Verified Only</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={femaleOnly} onChange={e => setFemaleOnly(e.target.checked)} className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5" />
                <span className="font-semibold text-purple-750">Female Only</span>
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
            <div className="space-y-2">
              {data?.content.map((ride, index) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onMouseEnter={() => void loadRideDetails(ride.id)}
                  onClick={() => void loadRideDetails(ride.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition duration-200 ${
                    activeId === ride.id ? "border-indigo-200 bg-indigo-50/70" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-xs font-bold text-white shadow-sm overflow-hidden">
                          {ride.driverGender === 'FEMALE' ? '👩‍🎓' : 'SF'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">{ride.driverName.split(" ")[0]}</span>
                            {ride.driverGender === 'FEMALE' && <span className="inline-flex items-center rounded bg-purple-50 px-1 py-0.2 text-[8px] font-bold text-purple-700 ring-1 ring-inset ring-purple-700/10">Female</span>}
                            {ride.driverTrustScore > 5 && <span className="inline-flex items-center rounded bg-emerald-50 px-1 py-0.2 text-[8px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Trusted</span>}
                            {ride.driverCollegeName && (
                              <span className="inline-flex items-center rounded bg-blue-50 px-1 py-0.2 text-[8px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10" title={ride.driverCollegeName}>
                                🎓 {ride.driverCollegeName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-indigo-600">₹{ride.pricePerSeat}</div>
                        <div className="text-[9px] font-medium text-slate-500 -mt-0.5">per seat</div>
                      </div>
                    </div>

                    <div className="space-y-0.5 pl-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span className="truncate">{ride.origin.split(",")[0]}</span>
                      </div>
                      <div className="ml-0.75 h-2 border-l border-dashed border-slate-350" />
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                        <span className="truncate">{ride.destination.split(",")[0]}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-500">
                      <span className="inline-flex items-center gap-0.5"><Clock3 className="h-3 w-3 text-slate-400" /> {new Date(ride.departureTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5"><Users className="h-3 w-3 text-slate-400" /> {ride.seatsAvailable} seats left</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-450 fill-amber-455 text-amber-500" /> 4.9</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[10px] text-indigo-600 font-bold">Tap to view route</span>
                      <Link to={`/rides/${ride.id}`} className="shrink-0">
                        <GradientButton className="py-1.5 px-3 text-[10px] font-black" variant="primary">Details</GradientButton>
                      </Link>
                    </div>
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
            height={mapHeight}
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
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-4 text-center sm:text-left">
              <MapPin className="mx-auto sm:mx-0 h-4 w-4 text-indigo-500" />
              <div className="mt-1.5 text-sm sm:text-xl font-bold text-slate-950">{distance?.toFixed(1)} km</div>
              <div className="text-[9px] sm:text-xs text-slate-500">distance</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-4 text-center sm:text-left">
              <Clock3 className="mx-auto sm:mx-0 h-4 w-4 text-indigo-500" />
              <div className="mt-1.5 text-sm sm:text-xl font-bold text-slate-950">{eta} min</div>
              <div className="text-[9px] sm:text-xs text-slate-500">ETA</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-2.5 sm:p-4 text-center sm:text-left">
              <CarFront className="mx-auto sm:mx-0 h-4 w-4 text-indigo-500" />
              <div className="mt-1.5 text-sm sm:text-xl font-bold text-slate-950">{data?.totalElements ?? 0}</div>
              <div className="text-[9px] sm:text-xs text-slate-500">rides</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button
              className="py-2.5 text-xs px-2"
              variant={pinTarget === "pickup" ? "primary" : "secondary"}
              onClick={() => setPinTarget((value) => (value === "pickup" ? null : "pickup"))}
            >
              Pickup
            </Button>
            <Button
              className="py-2.5 text-xs px-2"
              variant={pinTarget === "drop" ? "primary" : "secondary"}
              onClick={() => setPinTarget((value) => (value === "drop" ? null : "drop"))}
            >
              Drop
            </Button>
            <Button
              className="py-2.5 text-xs px-2"
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
              Clear
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
