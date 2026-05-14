import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";

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
  seatsBooked: number;
  status: string;
};

export function DriverInboxPage() {
  const { me } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isDriver = me?.role === "DRIVER" || me?.role === "ADMIN";

  async function loadRides() {
    setError(null);
    try {
      const res = await api.get<Ride[]>("/api/me/driver/rides");
      setRides(res.data);
      if (!selectedRideId && res.data.length > 0) setSelectedRideId(res.data[0].id);
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

  useEffect(() => {
    if (!isDriver) return;
    void loadRides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriver]);

  useEffect(() => {
    if (!isDriver) return;
    if (selectedRideId) void loadBookings(selectedRideId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRideId, isDriver]);

  if (!isDriver) {
    return (
      <Card title="Inbox" subtitle="Driver-only booking inbox">
        <div className="text-sm text-slate-700">Register as a DRIVER to access the inbox.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver inbox"
        subtitle="See bookings for your rides, cancel a ride if needed, and keep passengers updated."
        imageUrl="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80"
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
              <div key={b.bookingId} className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{b.passengerName}</div>
                  <div className="text-xs text-slate-600">{b.status}</div>
                </div>
                <div className="mt-1 text-sm text-slate-700">{b.passengerEmail}</div>
                <div className="mt-2 text-sm text-slate-700">Seats booked: <span className="font-semibold">{b.seatsBooked}</span></div>
                <div className="mt-1 text-xs text-slate-500">Booking #{b.bookingId}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
}
