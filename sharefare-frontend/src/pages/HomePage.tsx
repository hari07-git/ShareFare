import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { GradientButton } from "../components/GradientButton";
import { BadgeIndianRupee, Calendar, Leaf, ShieldCheck, Star, Users } from "lucide-react";

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

function Stat({
  label,
  value,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: React.ReactNode;
  icon: any;
  tone?: "blue" | "green" | "amber" | "indigo";
}) {
  const toneCls =
    tone === "green"
      ? "from-emerald-500/25 to-emerald-400/5"
      : tone === "amber"
        ? "from-amber-500/25 to-amber-400/5"
        : tone === "indigo"
          ? "from-indigo-500/25 to-indigo-400/5"
          : "from-blue-500/25 to-cyan-400/5";
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_-65px_rgba(2,6,23,0.85)] backdrop-blur-xl transition hover:-translate-y-[2px] hover:bg-white/7">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${toneCls} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-300/80">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
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
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-cyan-500/15 shadow-[0_60px_160px_-120px_rgba(2,6,23,0.9)]">
        <div className="px-6 py-8 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden h-12 w-12 rounded-2xl bg-white/10 ring-1 ring-white/10 sm:block" />
              <div>
                <div className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  Welcome back{me?.fullName ? `, ${me.fullName}` : ""}!
                </div>
                <div className="mt-1 text-sm text-slate-100/80">
                  Your mobility dashboard — bookings, notifications, and driver tools.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <GradientButton onClick={() => (window.location.href = "/rides/find")}>Find a ride</GradientButton>
              <GradientButton variant="ghost" onClick={() => (window.location.href = "/rides/offer")}>
                Offer ride
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="text-sm text-rose-300">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Total bookings" value={bookings.filter((b) => b.status !== "CANCELLED").length} icon={Calendar} tone="indigo" />
        <Stat label="Unread notifications" value={unreadCount} icon={Users} tone="blue" />
        <Stat label="Rating" value={"4.9"} icon={Star} tone="amber" />
        <Stat label="CO₂ saved" value={"85kg"} icon={Leaf} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card title="Upcoming rides" subtitle="Your scheduled journeys">
            {upcomingBookings.length === 0 ? (
              <div className="text-sm text-slate-300/90">
                No upcoming bookings. <Link className="underline" to="/rides/find">Find a ride</Link>.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((b) => (
                  <Link
                    key={b.bookingId}
                    to={`/rides/${b.rideId}`}
                    className="block rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/8"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[220px]">
                        <div className="text-sm font-semibold text-white">{b.origin} → {b.destination}</div>
                        <div className="mt-1 text-xs text-slate-300/90">
                          {new Date(b.departureTime).toLocaleString()} • Seats: {b.seatsBooked}
                        </div>
                      </div>
                      <div className="text-xs text-slate-300/80">
                        Status: <span className="text-white">{b.status}</span>
                      </div>
                      <GradientButton className="py-2" variant="primary">Details</GradientButton>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card title="Recent notifications" subtitle="Ride updates and booking alerts">
            {notifs.length === 0 ? (
              <div className="text-sm text-slate-300/90">No notifications yet.</div>
            ) : (
              <div className="space-y-3">
                {notifs.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-3xl border p-4 transition ${
                      n.read ? "border-white/10 bg-white/5" : "border-cyan-300/20 bg-cyan-400/10"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-white">{n.title}</div>
                      <div className="text-xs text-slate-300/80">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-200/90 line-clamp-2">{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {isDriver ? (
            <Card title="Driver tools" subtitle="Manage rides you offered">
              <div className="flex flex-wrap items-center gap-2">
                <GradientButton onClick={() => (window.location.href = "/me/driver/inbox")}>Open inbox</GradientButton>
                <GradientButton variant="ghost" onClick={() => (window.location.href = "/rides/offer")}>Offer another</GradientButton>
                {isAdmin ? <GradientButton variant="ghost" onClick={() => (window.location.href = "/admin")}>Admin dashboard</GradientButton> : null}
              </div>
              {driverRides.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {driverRides.map((r) => (
                    <div key={r.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm font-semibold text-white">{r.origin} → {r.destination}</div>
                      <div className="mt-1 text-xs text-slate-300/90">{new Date(r.departureTime).toLocaleString()}</div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300/80">
                        <span>Seats: {r.seatsAvailable}/{r.seatsTotal}</span>
                        <span className="inline-flex items-center gap-1"><BadgeIndianRupee className="h-3.5 w-3.5" /> {r.pricePerSeat}</span>
                        <span>Status: {r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-sm text-slate-300/90">No rides offered yet.</div>
              )}
            </Card>
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card title="Profile status" subtitle="Complete your details for trust">
            <div className="space-y-3 text-sm text-slate-200/90">
              <div className="flex items-center justify-between">
                <div>Completeness</div>
                <div className="font-semibold text-white">85%</div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
              </div>
              <div className="grid gap-2 pt-2 text-xs text-slate-300/90">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" /> Email verified
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" /> Phone added
                </div>
                <div className="flex items-center gap-2 opacity-80">
                  <ShieldCheck className="h-4 w-4 text-slate-400" /> Add profile photo (coming soon)
                </div>
              </div>
              <div className="pt-3">
                <Link to="/me/profile">
                  <GradientButton className="w-full" variant="secondary">Update profile</GradientButton>
                </Link>
              </div>
            </div>
          </Card>

          <Card title="Quick actions" subtitle="One-tap navigation">
            <div className="grid gap-2">
              <Link to="/rides/find">
                <GradientButton className="w-full" variant="secondary">Find a ride</GradientButton>
              </Link>
              <Link to="/rides/offer">
                <GradientButton className="w-full" variant="secondary">Offer a ride</GradientButton>
              </Link>
              <Link to="/me/bookings">
                <GradientButton className="w-full" variant="secondary">My bookings</GradientButton>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
