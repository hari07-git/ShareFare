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
      ? "bg-emerald-50 text-emerald-600"
      : tone === "amber"
        ? "bg-amber-50 text-amber-600"
        : tone === "indigo"
          ? "bg-indigo-50 text-indigo-600"
          : "bg-sky-50 text-sky-600";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-[2px]">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${toneCls}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

export function HomePage() {
  const { me } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [driverRides, setDriverRides] = useState<Ride[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      try {
        const res = await api.get<Ride[]>("/api/me/driver/rides");
        setDriverRides(res.data.slice(0, 5));
      } catch {
        // ignore
      }
    }
    void loadDriver();
  }, []);

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════════════════
          DASHBOARD HERO — city-at-night cinematic
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Background image — Hyderabad city at night */}
        <div className="absolute inset-0 sf-hero-city" />

        {/* Ambient glows */}
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/50 to-transparent" />

        <div className="relative grid items-center gap-8 px-6 py-10 sm:px-10 md:min-h-[340px] md:py-12 lg:grid-cols-[1fr_auto] lg:px-14">

          {/* LEFT — greeting + trust badges */}
          <div>
            {/* Verified badge */}
            {me?.accountStatus === "VERIFIED_STUDENT" && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Campus Member
              </div>
            )}

            {/* Greeting */}
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              {me?.fullName ? (
                <>Good to see you,<br /><span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">{me.fullName.split(" ")[0]}.</span></>
              ) : (
                "Your campus mobility hub."
              )}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">
              Verified rides for smarter student travel — bookings, alerts, and offered rides in one place.
            </p>

            {/* Trust indicators */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> Verified Students Only
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> 4.9 Community Rating
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                <Leaf className="h-3 w-3 text-emerald-400" /> 85kg CO₂ Saved
              </span>
            </div>
          </div>

          {/* RIGHT — quick action cards */}
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <GradientButton
              onClick={() => (window.location.href = "/rides/find")}
              className="justify-center px-6 py-3.5 text-sm font-bold shadow-xl shadow-indigo-500/25 md:w-48"
            >
              🔍 Find a ride
            </GradientButton>
            <button
              onClick={() => (window.location.href = "/rides/offer")}
              className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 md:w-48"
            >
              🚗 Offer a ride
            </button>
            <Link to="/me/bookings">
              <button className="w-full rounded-xl border border-white/15 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white/80 backdrop-blur transition hover:bg-white/15 md:w-48">
                📋 My bookings
              </button>
            </Link>
          </div>
        </div>
      </section>

      {error ? <div className="text-sm text-rose-600">{error}</div> : null}


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
              <div className="text-sm text-slate-600">
                No upcoming bookings. <Link className="underline" to="/rides/find">Find a ride</Link>.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((b) => (
                  <Link
                    key={b.bookingId}
                    to={`/rides/${b.rideId}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[220px]">
                        <div className="text-sm font-semibold text-slate-950">{b.origin} → {b.destination}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {new Date(b.departureTime).toLocaleString()} • Seats: {b.seatsBooked}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        Status: <span className="text-slate-900">{b.status}</span>
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
              <div className="text-sm text-slate-600">No notifications yet.</div>
            ) : (
              <div className="space-y-3">
                {notifs.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-2xl border p-4 transition ${
                      n.read ? "border-slate-200 bg-white" : "border-indigo-200 bg-indigo-50"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-950">{n.title}</div>
                      <div className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600 line-clamp-2">{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="My Offered Rides" subtitle="Manage rides you offered">
              <div className="flex flex-wrap items-center gap-2">
                <GradientButton onClick={() => (window.location.href = "/me/driver/inbox")}>Open ride inbox</GradientButton>
                <GradientButton variant="ghost" onClick={() => (window.location.href = "/rides/offer")}>Offer another</GradientButton>
                {isAdmin ? <GradientButton variant="ghost" onClick={() => (window.location.href = "/admin")}>Admin dashboard</GradientButton> : null}
              </div>
              {driverRides.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {driverRides.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-sm font-semibold text-slate-950">{r.origin} → {r.destination}</div>
                      <div className="mt-1 text-xs text-slate-500">{new Date(r.departureTime).toLocaleString()}</div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Seats: {r.seatsAvailable}/{r.seatsTotal}</span>
                        <span className="inline-flex items-center gap-1"><BadgeIndianRupee className="h-3.5 w-3.5" /> {r.pricePerSeat}</span>
                        <span>Status: {r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-sm text-slate-600">No rides offered yet.</div>
              )}
            </Card>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card title="Profile status" subtitle="Complete your details for trust">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <div>Completeness</div>
                <div className="font-semibold text-slate-950">85%</div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300" />
              </div>
              <div className="grid gap-2 pt-2 text-xs text-slate-600">
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
