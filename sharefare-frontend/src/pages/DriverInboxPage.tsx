import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { toast } from "../components/Toast";
import { ChatModal } from "../components/ChatModal";
import { useSearchParams } from "react-router-dom";

type Ride = {
  id: number;
  origin: string;
  destination: string;
  departureTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  pricePerSeat: number;
  status: string;
};

type Booking = {
  bookingId: number;
  rideId: number;
  passengerEmail: string;
  passengerName: string;
  passengerPhone: string | null;
  seatsBooked: number;
  status: string;
  createdAt: string;
};

export function DriverInboxPage() {
  const { me } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [chatBookingId, setChatBookingId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const queryRideId = searchParams.get("rideId");

  async function loadRides() {
    setError(null);
    try {
      const res = await api.get<Ride[]>("/api/me/driver/rides");
      setRides(res.data);
      const targetRideId = queryRideId ? Number(queryRideId) : null;
      if (targetRideId && res.data.some((r) => r.id === targetRideId)) {
        setSelectedRideId(targetRideId);
      } else if (!selectedRideId && res.data.length > 0) {
        setSelectedRideId(res.data[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load rides");
    }
  }

  async function loadBookings(rideId: number) {
    setBusy(true);
    setError(null);
    try {
      const res = await api.get<Booking[]>(`/api/me/driver/rides/${rideId}/bookings`);
      setBookings(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load bookings");
    } finally {
      setBusy(false);
    }
  }

  async function cancelRide(rideId: number) {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/me/driver/rides/${rideId}/cancel`);
      await loadRides();
      await loadBookings(rideId);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to cancel ride");
    } finally {
      setBusy(false);
    }
  }

  async function updateBooking(booking: Booking, action: "approve" | "reject" | "confirm" | "start" | "complete") {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/api/me/driver/rides/${booking.rideId}/bookings/${booking.bookingId}/${action}`);
      const labels = {
        approve: "approved",
        reject: "rejected",
        confirm: "confirmed",
        start: "started",
        complete: "completed"
      };
      toast(`Booking ${labels[action]}`, action === "reject" ? "info" : "success");
      await loadRides();
      await loadBookings(booking.rideId);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? `Failed to ${action} booking`;
      setError(message);
      toast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  function bookingActions(booking: Booking) {
    if (booking.status === "REQUESTED") {
      return (
        <>
          <Button disabled={busy} onClick={() => void updateBooking(booking, "approve")}>Approve</Button>
          <Button variant="secondary" disabled={busy} onClick={() => void updateBooking(booking, "reject")}>Reject</Button>
        </>
      );
    }
    if (booking.status === "DRIVER_APPROVED") {
      return <Button disabled={busy} onClick={() => void updateBooking(booking, "confirm")}>Confirm pickup</Button>;
    }
    if (booking.status === "CONFIRMED") {
      return <Button disabled={busy} onClick={() => void updateBooking(booking, "start")}>Start ride</Button>;
    }
    if (booking.status === "ONGOING") {
      return <Button disabled={busy} onClick={() => void updateBooking(booking, "complete")}>Complete ride</Button>;
    }
    return null;
  }

  useEffect(() => {
    void loadRides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryRideId]);

  useEffect(() => {

    if (selectedRideId) void loadBookings(selectedRideId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRideId]);


  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver inbox"
        subtitle="See bookings for your rides, cancel a ride if needed, and keep passengers updated."
        imageUrl="/images/gachibowli-road.jpg"
      />

      <div className="grid gap-6 md:grid-cols-3">
      <Card title="Your rides" subtitle="Select a ride to view bookings">
        {error ? <div className="mb-3 text-sm text-red-600">{error}</div> : null}
        {rides.length === 0 ? <div className="text-sm text-slate-600">No rides offered yet.</div> : null}
        <div className="space-y-2">
          {rides.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRideId(r.id)}
              className={`w-full rounded-2xl border p-3 text-left transition ${
                selectedRideId === r.id ? "border-indigo-200 bg-indigo-50/70" : "border-white/60 bg-white/60 hover:bg-white/80"
              }`}
            >
              <div className="text-sm font-semibold">{r.origin} → {r.destination}</div>
              <div className="mt-1 text-xs text-slate-600">{new Date(r.departureTime).toLocaleString()}</div>
              <div className="mt-1 text-xs text-slate-600">Seats: {r.seatsAvailable}/{r.seatsTotal} • ₹{r.pricePerSeat} • {r.status}</div>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Button variant="secondary" onClick={loadRides}>Refresh</Button>
        </div>
      </Card>

      <div className="md:col-span-2">
        <Card
          title="Bookings inbox"
          subtitle={selectedRideId ? `Ride #${selectedRideId}` : "Pick a ride"}
        >
          {selectedRideId ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Canceling a ride notifies passengers who booked it.
              </div>
              <Button
                variant="danger"
                disabled={busy}
                onClick={() => void cancelRide(selectedRideId)}
              >
                {busy ? "Working..." : "Cancel ride"}
              </Button>
            </div>
          ) : null}
          {busy ? <div className="text-sm text-slate-600">Loading bookings...</div> : null}
          {!busy && selectedRideId && bookings.length === 0 ? (
            <div className="text-sm text-slate-600">No bookings yet for this ride.</div>
          ) : null}
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.bookingId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                      {b.passengerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-950 flex items-center gap-2">
                        {b.passengerName}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {b.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {b.passengerEmail} {b.passengerPhone ? `• ${b.passengerPhone}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{b.seatsBooked} {b.seatsBooked === 1 ? 'seat' : 'seats'}</div>
                    <div className="mt-1 text-xs text-slate-500">{new Date(b.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                
                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {bookingActions(b)}
                  <Button 
                    variant="secondary" 
                    className="ml-auto" 
                    onClick={() => setChatBookingId(b.bookingId)}
                  >
                    Message rider
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      </div>

      {chatBookingId && (
        <ChatModal bookingId={chatBookingId} onClose={() => setChatBookingId(null)} />
      )}
    </div>
  );
}
