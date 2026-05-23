import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { DarkMap } from "../components/DarkMap";
import { GradientButton } from "../components/GradientButton";
import { PlaceResult, reverseGeocode } from "../lib/geocode";
import { distanceKm, estimateEtaMinutes, estimateFare } from "../lib/route";
import { BadgeIndianRupee, CalendarClock, CarFront, Clock3, Luggage, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../state/auth";

function toBackendDepartureTime(value: string) {
  if (!value.trim()) return "";
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) return value;
  return `${value.length === 16 ? `${value}:00` : value}+05:30`;
}

function todayLocalDateTimeMin() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function apiMessage(err: any) {
  const fields = err?.response?.data?.fields;
  if (fields && typeof fields === "object") {
    return Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join(", ");
  }
  return err?.response?.data?.message ?? "Failed to offer ride. Please check the ride details and try again.";
}

export function OfferRidePage() {
  const { me } = useAuth();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [seatsTotal, setSeatsTotal] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState(50);
  const [contactPhone, setContactPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("Hyundai i20");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [pickupNote, setPickupNote] = useState("");
  const [femalePreferred, setFemalePreferred] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [originPlace, setOriginPlace] = useState<PlaceResult | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<PlaceResult | null>(null);
  const [originPin, setOriginPin] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationPin, setDestinationPin] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState<"o" | "d" | null>(null);
  const [pinTarget, setPinTarget] = useState<"pickup" | "drop" | null>("pickup");
  const [luggage, setLuggage] = useState<"small" | "medium" | "large">("small");
  const [manualPrice, setManualPrice] = useState(false);
  const [mapHeight, setMapHeight] = useState(500);

  useEffect(() => {
    const handleResize = () => {
      setMapHeight(window.innerWidth < 640 ? 300 : 500);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pickup = originPin ?? (originPlace ? { lat: originPlace.lat, lng: originPlace.lng } : null);
  const drop = destinationPin ?? (destinationPlace ? { lat: destinationPlace.lat, lng: destinationPlace.lng } : null);
  const distance = distanceKm(pickup, drop);
  const eta = estimateEtaMinutes(distance);
  const suggestedFare = estimateFare(distance, seatsTotal);
  const gross = pricePerSeat * seatsTotal;
  const fee = gross * 0.05;

  useEffect(() => {
    if (!manualPrice && suggestedFare !== null) setPricePerSeat(suggestedFare);
  }, [manualPrice, suggestedFare]);

  function useMyLocation(which: "o" | "d") {
    if (!navigator.geolocation) {
      setError("Geolocation not supported in this browser.");
      return;
    }
    setGeoBusy(which);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (which === "o") {
          setOriginPin(point);
          const name = await reverseGeocode(point.lat, point.lng);
          if (name) setOrigin(name);
        } else {
          setDestinationPin(point);
          const name = await reverseGeocode(point.lat, point.lng);
          if (name) setDestination(name);
        }
        setGeoBusy(null);
      },
      () => {
        setGeoBusy(null);
        setError("Unable to fetch your location. Please allow location permission.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!pickup || !drop) {
        setError("Please select pickup and destination suggestions so the map pins are set.");
        return;
      }
      if (me?.accountStatus !== "VERIFIED_STUDENT" && me?.role !== "ADMIN") {
        setError("Only verified campus students can publish rides. Please verify your campus student ID first.");
        return;
      }
      if (contactPhone.trim()) {
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
        departureTime: toBackendDepartureTime(departureTime),
        seatsTotal,
        pricePerSeat,
        originLat: pickup?.lat ?? null,
        originLng: pickup?.lng ?? null,
        destinationLat: drop?.lat ?? null,
        destinationLng: drop?.lng ?? null,
        vehicleType: vehicleType.trim() || null,
        vehicleNumber: vehicleNumber.trim() || null,
        pickupNote: pickupNote.trim() || null,
        femalePreferred,
        verifiedOnly
      });
      setOrigin("");
      setDestination("");
      setDepartureTime("");
      setSeatsTotal(3);
      setPricePerSeat(50);
      setContactPhone("");
      setVehicleType("Hyundai i20");
      setVehicleNumber("");
      setPickupNote("");
      setOriginPlace(null);
      setDestinationPlace(null);
      setOriginPin(null);
      setDestinationPin(null);
      setError("Ride published successfully.");
    } catch (err: any) {
      setError(apiMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const nearby = useMemo(
    () => [
      { lat: 17.437, lng: 78.366 },
      { lat: 17.456, lng: 78.382 },
      { lat: 17.432, lng: 78.392 }
    ],
    []
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,460px)_1fr]">
      <form onSubmit={submit} className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <CarFront className="h-3.5 w-3.5" />
            Campus ride studio
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Offer a ride</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Build a clear pickup, drop, fare, and contact flow that riders can trust before booking.
          </p>
          
          {me?.accountStatus !== "VERIFIED_STUDENT" && me?.role !== "ADMIN" && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-rose-600" />
                <div>
                  <h3 className="text-sm font-semibold text-rose-900">Verified student required</h3>
                  <p className="mt-1 text-xs text-rose-700">
                    Only verified campus students can publish rides. Please upload your student ID card in your Profile page to get verified.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-slate-950">Route details</div>
              <div className="mt-1 text-xs text-slate-500">Search places or click the map to set pins</div>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {pinTarget === "pickup" ? "Pickup mode" : pinTarget === "drop" ? "Drop mode" : "View mode"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">Pickup</div>
              <LocationAutocomplete
                value={origin}
                onValue={(value) => {
                  setOrigin(value);
                  setOriginPlace(null);
                  setOriginPin(null);
                }}
                placeholder="Pickup: college, metro, area..."
                disabled={geoBusy !== null}
                onSelect={(place) => {
                  setOriginPlace(place);
                  setOriginPin({ lat: place.lat, lng: place.lng });
                  setOrigin(place.displayName);
                }}
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">Destination</div>
              <LocationAutocomplete
                value={destination}
                onValue={(value) => {
                  setDestination(value);
                  setDestinationPlace(null);
                  setDestinationPin(null);
                }}
                placeholder="Drop: HITEC City, JNTU, Secunderabad..."
                disabled={geoBusy !== null}
                onSelect={(place) => {
                  setDestinationPlace(place);
                  setDestinationPin({ lat: place.lat, lng: place.lng });
                  setDestination(place.displayName);
                }}
              />
            </div>

            <FormField label="Departure time">
              <div className="relative">
                <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                <Input
                  value={departureTime}
                  onChange={(event) => setDepartureTime(event.target.value)}
                  className="pl-10"
                  type="datetime-local"
                  min={todayLocalDateTimeMin()}
                  required
                />
              </div>
            </FormField>

            <FormField label="Contact phone shared after booking">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                <Input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} className="pl-10" placeholder="+91 9XXXXXXXXX" />
              </div>
            </FormField>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Vehicle type">
                <Input value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} placeholder="Maruti Swift, Activa, i20..." />
              </FormField>
              <FormField label="Vehicle number">
                <Input value={vehicleNumber} onChange={(event) => setVehicleNumber(event.target.value)} placeholder="TS09 AB 1234" />
              </FormField>
            </div>

            <FormField label="Pickup note">
              <Input value={pickupNote} onChange={(event) => setPickupNote(event.target.value)} placeholder="Example: near JNTU metro gate 2" />
            </FormField>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 text-base font-semibold text-slate-950">Ride settings</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Seats">
              <div className="grid grid-cols-6 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {[1, 2, 3, 4, 5, 6].map((seat) => (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => setSeatsTotal(seat)}
                    className={`h-10 rounded-lg text-sm font-semibold transition ${seat === seatsTotal ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white"}`}
                  >
                    {seat}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Price per seat">
              <div className="relative">
                <BadgeIndianRupee className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                <Input
                  value={pricePerSeat}
                  onChange={(event) => {
                    setManualPrice(true);
                    setPricePerSeat(parseFloat(event.target.value || "0"));
                  }}
                  className="pl-10"
                  type="number"
                  min={0}
                  step="0.5"
                />
              </div>
            </FormField>
          </div>
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold text-slate-600">Luggage</div>
            <div className="grid grid-cols-3 gap-2">
              {(["small", "medium", "large"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLuggage(option)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition ${
                    luggage === option ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Luggage className="mx-auto mb-1 h-4 w-4" />
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="mb-3 text-xs font-semibold text-slate-600">Safety Preferences</div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  checked={verifiedOnly} 
                  onChange={e => setVerifiedOnly(e.target.checked)} 
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Verified Students Only</div>
                  <div className="text-xs text-slate-500">Only fully verified users can book this ride</div>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50 p-3 cursor-pointer hover:bg-purple-100/50 transition">
                <input 
                  type="checkbox" 
                  checked={femalePreferred} 
                  onChange={e => setFemalePreferred(e.target.checked)} 
                  className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500" 
                />
                <div>
                  <div className="text-sm font-semibold text-purple-900">Female Passengers Preferred</div>
                  <div className="text-xs text-purple-700">Display this ride prominently to female riders</div>
                </div>
              </label>
            </div>
          </div>

          {error ? <div className={`mt-4 text-sm ${error.includes("success") ? "text-emerald-600" : "text-rose-600"}`}>{error}</div> : null}
          <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">
            Share a ride with your campus community.
          </div>
          <GradientButton 
            disabled={busy || (me?.accountStatus !== "VERIFIED_STUDENT" && me?.role !== "ADMIN")} 
            type="submit" 
            className="mt-5 w-full"
          >
            {(me?.accountStatus !== "VERIFIED_STUDENT" && me?.role !== "ADMIN") ? "Verified student required" : busy ? "Publishing..." : "Publish ride"}
          </GradientButton>
        </section>
      </form>

      <div className="space-y-5 lg:sticky lg:top-24">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <DarkMap
            pickup={pickup}
            drop={drop}
            nearby={nearby}
            height={mapHeight}
            clickTarget={pinTarget}
            onPick={async (point) => {
              if (pinTarget === "pickup") {
                setOriginPin(point);
                const name = await reverseGeocode(point.lat, point.lng);
                if (name) setOrigin(name);
              }
              if (pinTarget === "drop") {
                setDestinationPin(point);
                const name = await reverseGeocode(point.lat, point.lng);
                if (name) setDestination(name);
              }
            }}
          />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button variant={pinTarget === "pickup" ? "primary" : "secondary"} type="button" className="py-2.5 text-xs px-2" onClick={() => setPinTarget("pickup")}>Pickup pin</Button>
            <Button variant={pinTarget === "drop" ? "primary" : "secondary"} type="button" className="py-2.5 text-xs px-2" onClick={() => setPinTarget("drop")}>Drop pin</Button>
            <Button variant="secondary" type="button" className="py-2.5 text-xs px-2" disabled={geoBusy !== null} onClick={() => useMyLocation("o")}>
              {geoBusy === "o" ? "Locating..." : "My location"}
            </Button>
            <Button variant="secondary" type="button" className="py-2.5 text-xs px-2" onClick={() => { setOriginPin(null); setDestinationPin(null); setOriginPlace(null); setDestinationPlace(null); }}>Clear</Button>
          </div>
        </section>
 
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Distance", value: distance ? `${distance.toFixed(1)} km` : "Set pins", icon: MapPin },
            { label: "ETA", value: eta ? `${eta} min` : "Set pins", icon: Clock3 },
            { label: "Seats", value: `${seatsTotal}`, icon: Users },
            { label: "You receive", value: `₹${Math.max(0, gross - fee).toFixed(0)}`, icon: ShieldCheck }
          ].map(({ label, value, icon: Icon }) => (
            <motion.div whileHover={{ y: -3 }} key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Icon className="h-4 w-4 text-indigo-500" />
              <div className="mt-3 text-xl font-semibold text-slate-950">{value}</div>
              <div className="mt-1 text-xs text-slate-500">{label}</div>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}
