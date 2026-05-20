import { Link } from "react-router-dom";
import { BadgeIndianRupee, CarFront, Phone, ShieldCheck, Star, Users } from "lucide-react";
import { Button } from "./Button";
import { DarkMap } from "./DarkMap";
import { FormField } from "./FormField";
import { Input } from "./Input";
import { SOSButton, ShareTripButton } from "./SafetyActions";

type LatLng = { lat: number; lng: number };

export type RideDetailsViewModel = {
  id: number;
  driverEmail: string;
  driverName: string;
  driverPhone: string | null;
  origin: string;
  destination: string;
  departureTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  pricePerSeat: number;
  status: string;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  pickupNote?: string | null;
};

export function DriverProfileCard({ ride }: { ride: RideDetailsViewModel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-950">Driver profile</div>
      <div className="mt-3 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">
          {ride.driverName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-slate-950">{ride.driverName}</div>
          <div className="text-sm text-slate-600">{ride.driverEmail}</div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
            <Star className="h-3 w-3 fill-current" /> 4.9 verified
          </div>
        </div>
      </div>
      {ride.driverPhone ? (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
          <Phone className="mr-2 inline h-4 w-4" />
          {ride.driverPhone}
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          Driver phone is shared after booking confirmation.
        </div>
      )}
      <div className="mt-3 grid gap-2 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <span className="font-semibold text-slate-950">Vehicle:</span>{" "}
          <span className="text-slate-700">{ride.vehicleType || "Shared after driver updates profile"}</span>
        </div>
        {ride.vehicleNumber ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="font-semibold text-slate-950">Number:</span>{" "}
            <span className="text-slate-700">{ride.vehicleNumber}</span>
          </div>
        ) : null}
        {ride.pickupNote ? (
          <div className="rounded-xl bg-blue-50 p-3 text-blue-800">
            <span className="font-semibold">Pickup point:</span> {ride.pickupNote}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SeatAvailability({ ride }: { ride: RideDetailsViewModel }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <CarFront className="h-6 w-6" />
        </div>
        <div>
          <div className="text-lg font-semibold text-slate-950">{ride.origin} → {ride.destination}</div>
          <div className="text-sm text-slate-600">{new Date(ride.departureTime).toLocaleString()}</div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <Users className="h-4 w-4 text-blue-600" />
          <div className="mt-2 text-sm font-semibold text-slate-950">{ride.seatsAvailable}/{ride.seatsTotal} seats</div>
          <div className="text-xs text-slate-500">available</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <BadgeIndianRupee className="h-4 w-4 text-blue-600" />
          <div className="mt-2 text-sm font-semibold text-slate-950">₹{ride.pricePerSeat}</div>
          <div className="text-xs text-slate-500">per seat</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <div className="mt-2 text-sm font-semibold text-slate-950">{ride.status}</div>
          <div className="text-xs text-slate-500">ride status</div>
        </div>
      </div>
    </div>
  );
}

export function RouteMapCard({
  pickup,
  drop,
  distance,
  eta
}: {
  pickup: LatLng | null;
  drop: LatLng | null;
  distance: number | null;
  eta: number | null;
}) {
  return (
    <>
      <DarkMap pickup={pickup} drop={drop} height={360} />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          <div className="text-slate-500">Distance</div>
          <div className="mt-1 font-semibold text-slate-950">{distance ? `${distance.toFixed(1)} km` : "Not pinned"}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          <div className="text-slate-500">ETA</div>
          <div className="mt-1 font-semibold text-slate-950">{eta ? `${eta} min` : "Not available"}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          <div className="text-slate-500">Cancellation</div>
          <div className="mt-1 font-semibold text-slate-950">Free before driver confirms</div>
        </div>
      </div>
    </>
  );
}

export function FareBreakdown({
  pricePerSeat,
  seats
}: {
  pricePerSeat: number;
  seats: number;
}) {
  const subtotal = pricePerSeat * seats;
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + platformFee;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
      <div className="font-semibold text-slate-950">Fare breakdown</div>
      <div className="mt-3 space-y-2 text-slate-600">
        <div className="flex justify-between"><span>₹{pricePerSeat} × {seats}</span><span>₹{subtotal}</span></div>
        <div className="flex justify-between"><span>Platform fee</span><span>₹{platformFee}</span></div>
        <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-950"><span>Total</span><span>₹{total}</span></div>
      </div>
    </div>
  );
}

export function BookRidePanel({
  isLoggedIn,
  seats,
  maxSeats,
  onSeats,
  onBook
}: {
  isLoggedIn: boolean;
  seats: number;
  maxSeats: number;
  onSeats: (seats: number) => void;
  onBook: () => void;
}) {
  if (!isLoggedIn) {
    return (
      <div className="text-sm text-slate-700">
        Please <Link className="font-semibold text-blue-600 underline" to="/auth/login">login</Link> to book.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-40">
        <FormField label="Seats">
          <Input
            type="number"
            min={1}
            max={maxSeats}
            value={seats}
            onChange={(event) => onSeats(parseInt(event.target.value || "1", 10))}
          />
        </FormField>
      </div>
      <Button onClick={onBook}>Book ride</Button>
      <ShareTripButton />
      <SOSButton />
    </div>
  );
}
