import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

type Booking = {
  bookingId: number;
  rideId: number;
  origin: string;
  destination: string;
  departureTime: string;
  seatsBooked: number;
  status: string;
};

type Notification = {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

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

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export function HomePage() {
  const { me } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [driverRides, setDriverRides] = useState<Ride[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isDriver = me?.role === "DRIVER" || me?.role === "ADMIN";
  const isAdmin = me?.role === "ADMIN";

  const upcomingBookings = useMemo(() => {
    const now = Date.now();
    return bookings
      .filter((b) => b.status !== "CANCELLED" && new Date(b.departureTime).getTime() > now)
      .slice(0, 5);
  }, [bookings]);

  const unreadCount = useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const [bRes, nRes] = await Promise.all([
          api.get<Booking[]>("/api/me/bookings"),
          api.get<Notification[]>("/api/me/notifications")
        ]);
        setBookings(bRes.data);
        setNotifs(nRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Failed to load dashboard");
      }
    }
    void load();
  }, []);

  useEffect(() => {
    async function loadDriver() {
      if (!isDriver) return;
      try {
        const res = await api.get<Ride[]>("/api/me/driver/rides");
        setDriverRides(res.data.slice(0, 5));
      } catch {
        // ignore
      }
    }
    void loadDriver();
  }, [isDriver]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome${me?.fullName ? `, ${me.fullName}` : ""}`}
        subtitle="Quick actions, latest bookings, and notifications."
        imageUrl="https://images.unsplash.com/photo-1520975958225-928c0f318b8d?auto=format&fit=crop&w=1600&q=80"
        right={
          <div className="flex flex-wrap gap-3">
            <Link to="/rides/find">
              <Button>Find rides</Button>
            </Link>
            <Link to="/rides/offer">
              <Button variant="secondary">Offer a ride</Button>
            </Link>
            <Link to="/me/notifications">
              <Button variant="secondary">Notifications</Button>
            </Link>
          </div>
        }
      />

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Unread notifications" value={unreadCount} />
        <Stat label="Active bookings" value={bookings.filter((b) => b.status !== "CANCELLED").length} />
        <Stat label="Role" value={me?.role ?? "—"} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Upcoming bookings" subtitle="Your next rides">
          {upcomingBookings.length === 0 ? (
            <div className="text-sm text-slate-600">
              No upcoming bookings. <Link className="underline" to="/rides/find">Find a ride</Link>.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((b) => (
                <Link
                  key={b.bookingId}
                  to={`/rides/${b.rideId}`}
                  className="block rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{b.origin} → {b.destination}</div>
                    <div className="text-xs text-slate-600">Seats: {b.seatsBooked}</div>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{new Date(b.departureTime).toLocaleString()}</div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link to="/me/bookings">
              <Button variant="secondary">View all bookings</Button>
            </Link>
          </div>
        </Card>

        <Card title="Latest notifications" subtitle="Booking updates and ride alerts">
          {notifs.length === 0 ? (
            <div className="text-sm text-slate-600">No notifications yet.</div>
          ) : (
            <div className="space-y-3">
              {notifs.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-4 shadow-sm ${
                    n.read ? "border-white/60 bg-white/60" : "border-indigo-100 bg-indigo-50/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{n.title}</div>
                    <div className="text-xs text-slate-600">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-700 line-clamp-2">{n.message}</div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link to="/me/notifications">
              <Button variant="secondary">Open notifications</Button>
            </Link>
          </div>
        </Card>
      </div>

      {isDriver ? (
        <Card title="Driver tools" subtitle="Rides you offered and bookings inbox">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/me/driver/inbox">
              <Button>Open driver inbox</Button>
            </Link>
            <Link to="/rides/offer">
              <Button variant="secondary">Offer another ride</Button>
            </Link>
            {isAdmin ? (
              <Link to="/admin">
                <Button variant="secondary">Admin dashboard</Button>
              </Link>
            ) : null}
          </div>

          {driverRides.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {driverRides.map((r) => (
                <div key={r.id} className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
                  <div className="text-sm font-semibold">{r.origin} → {r.destination}</div>
                  <div className="mt-1 text-xs text-slate-600">{new Date(r.departureTime).toLocaleString()}</div>
                  <div className="mt-2 text-xs text-slate-600">Seats: {r.seatsAvailable}/{r.seatsTotal} • ₹{r.pricePerSeat} • {r.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 text-sm text-slate-600">No rides offered yet.</div>
          )}
        </Card>
      ) : null}
    </div>
  );
}

