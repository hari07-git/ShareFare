import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { NoBookingsEmpty } from "../components/NoBookingsEmpty";
import { BookingSkeleton } from "../components/Skeletons";
import { ChatModal } from "../components/ChatModal";
import { MessageSquare } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [chatBookingId, setChatBookingId] = useState<number | null>(null);
  const navigate = useNavigate();

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get<Booking[]>("/api/me/bookings");
      setItems(res.data);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 401) setError("Please login again.");
      else if (status === 403) setError("You are not allowed to view bookings.");
      else setError(msg ?? "Failed to load bookings");
    } finally {
      setLoading(false);
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

  function canCancel(status: string) {
    return !["CANCELLED", "REJECTED", "COMPLETED"].includes(status);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "REQUESTED": return "bg-amber-100 text-amber-800 border-amber-200";
      case "DRIVER_APPROVED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONFIRMED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "ONGOING": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "COMPLETED": return "bg-slate-100 text-slate-800 border-slate-200";
      case "CANCELLED":
      case "REJECTED": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My bookings"
        subtitle="Track your ride history, cancellations, and updates."
        imageUrl="/images/campus-commute.jpg"
      />
      <Card title="Booking history" subtitle="Your latest bookings">
        {error ? <div className="mb-4 text-sm text-rose-600">{error}</div> : null}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <BookingSkeleton key={index} />
            ))}
          </div>
        ) : null}
        {!loading && !error && items.length === 0 ? <NoBookingsEmpty onFindRide={() => navigate("/rides/find")} /> : null}
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.bookingId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link to={`/rides/${b.rideId}`} className="font-semibold text-slate-950 hover:text-blue-600">
                  {b.origin} → {b.destination}
                </Link>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  Seats: {b.seatsBooked} • 
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${getStatusColor(b.status)}`}>
                    {b.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Departure: {new Date(b.departureTime).toLocaleString()} • Ride ID: {b.rideId}
              </div>
              <div className="mt-1 text-sm text-slate-700">
                Contact: {b.driverName} ({b.driverEmail}){b.driverPhone ? ` • ${b.driverPhone}` : ""}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setChatBookingId(b.bookingId)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message driver
                </Button>
                <Button
                  variant="danger"
                  disabled={busyId === b.bookingId || !canCancel(b.status)}
                  onClick={() => cancel(b.bookingId)}
                >
                  {!canCancel(b.status) ? b.status.replace("_", " ") : busyId === b.bookingId ? "Cancelling..." : "Cancel booking"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {chatBookingId && (
        <ChatModal bookingId={chatBookingId} onClose={() => setChatBookingId(null)} />
      )}
    </div>
  );
}
