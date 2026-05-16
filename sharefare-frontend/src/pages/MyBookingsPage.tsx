import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";

type Booking = {
  bookingId: number;
  rideId: number;
  origin: string;
  destination: string;
  departureTime: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string | null;
  seatsBooked: number;
  status: string;
};

export function MyBookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await api.get<Booking[]>("/api/me/bookings");
      setItems(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 401) setError("Please login again.");
      else if (status === 403) setError("You are not allowed to view bookings.");
      else setError(msg ?? "Failed to load bookings");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function cancel(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await api.delete(`/api/bookings/${id}`);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Cancel failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My bookings"
        subtitle="Track your ride history, cancellations, and updates."
        imageUrl="https://images.unsplash.com/photo-1520916784675-1b97f1fc1c05?auto=format&fit=crop&w=1600&q=80"
      />
      <Card title="Booking history" subtitle="Your latest bookings">
        {error ? <div className="mb-4 text-sm text-rose-300">{error}</div> : null}
        {!error && items.length === 0 ? <div className="text-sm text-slate-300/90">No bookings yet.</div> : null}
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.bookingId} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_90px_-65px_rgba(2,6,23,0.85)] transition hover:-translate-y-[2px] hover:bg-white/7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-white">
                  {b.origin} → {b.destination}
                </div>
                <div className="text-sm text-slate-300/90">
                  Seats: {b.seatsBooked} • Status: {b.status}
                </div>
              </div>
              <div className="mt-1 text-sm text-slate-300/90">
                Departure: {new Date(b.departureTime).toLocaleString()} • Ride ID: {b.rideId}
              </div>
              <div className="mt-1 text-sm text-slate-200/90">
                Contact: {b.driverName} ({b.driverEmail}){b.driverPhone ? ` • ${b.driverPhone}` : ""}
              </div>
              <div className="mt-3">
                <Button
                  variant="danger"
                  disabled={busyId === b.bookingId || b.status === "CANCELLED"}
                  onClick={() => cancel(b.bookingId)}
                >
                  {b.status === "CANCELLED" ? "Cancelled" : busyId === b.bookingId ? "Cancelling..." : "Cancel booking"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
