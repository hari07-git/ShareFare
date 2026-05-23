import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { GradientButton } from "../components/GradientButton";
import {
  ArrowRight,
  BadgeIndianRupee, Calendar, Car, CheckCircle, Clock, Heart,
  Leaf, MapPin, Search, ShieldCheck, Sparkles, Star, Users, Zap
} from "lucide-react";
import { motion } from "framer-motion";


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
  type?: string;
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

/* ═══════════════════════════════════════════════════
   HOW IT WORKS STEPS
═══════════════════════════════════════════════════ */
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search Your Route",
    description: "Enter your pickup and destination. Instantly discover verified campus rides heading your way.",
    icon: Search,
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600"
  },
  {
    step: "02",
    title: "Book in Seconds",
    description: "Choose a driver with the best schedule and rating. Book your seat instantly with one click.",
    icon: CheckCircle,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600"
  },
  {
    step: "03",
    title: "Ride Together",
    description: "Meet at the pickup spot, enjoy a safe commute, and split the fare. Save money and the planet.",
    icon: Car,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600"
  }
];

/* ═══════════════════════════════════════════════════
   WHY SHAREFARE FEATURES
═══════════════════════════════════════════════════ */
const WHY_FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Students Only",
    description: "Every rider is campus-verified with college ID. No strangers, only your peers.",
    color: "border-emerald-200 bg-emerald-50/50",
    iconColor: "text-emerald-600 bg-emerald-100"
  },
  {
    icon: Zap,
    title: "Zero Commission",
    description: "We don't take a cut. Every rupee goes directly between riders. Fair and transparent.",
    color: "border-amber-200 bg-amber-50/50",
    iconColor: "text-amber-600 bg-amber-100"
  },
  {
    icon: Heart,
    title: "Safety First",
    description: "Female-preferred rides, trust scores, verified IDs, and real-time route tracking.",
    color: "border-rose-200 bg-rose-50/50",
    iconColor: "text-rose-600 bg-rose-100"
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Reduce your carbon footprint by sharing rides. Together, we make commuting greener.",
    color: "border-emerald-200 bg-emerald-50/50",
    iconColor: "text-emerald-600 bg-emerald-100"
  }
];

export function HomePage() {
  const { me } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [driverRides, setDriverRides] = useState<Ride[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await api.post(`/api/me/notifications/${n.id}/read`);
        setNotifs((prev) => prev.map((item) => item.id === n.id ? { ...item, read: true } : item));
      } catch (e) {
        console.error("Failed to mark notification as read", e);
      }
    }

    const rideMatch = n.message.match(/ride #(\d+)/i);
    const rideId = rideMatch ? rideMatch[1] : null;

    let targetUrl = "/home";

    const title = n.title.toLowerCase();
    const msg = n.message.toLowerCase();
    const type = (n.type || "").toLowerCase();

    if (
      title.includes("new booking request") ||
      title.includes("booking cancelled") ||
      msg.includes("requested to join your ride") ||
      msg.includes("cancelled booking") ||
      msg.includes("passenger pickup")
    ) {
      targetUrl = rideId ? `/rides/${rideId}` : "/ride-requests";
    } else if (type === "booking" || type === "ride" || title.includes("booking") || title.includes("ride")) {
      targetUrl = rideId ? `/rides/${rideId}` : "/me/bookings";
    } else if (type === "message" || title.includes("message") || title.includes("new message")) {
      targetUrl = rideId ? `/rides/${rideId}` : "/me/bookings";
    } else if (type === "system" || type === "verification" || title.includes("verif") || title.includes("approved")) {
      targetUrl = "/me/profile";
    }

    navigate(targetUrl);
  };

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
    <div className="space-y-8">

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
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col w-full lg:w-auto">
            <GradientButton
              onClick={() => (window.location.href = "/rides/find")}
              className="justify-center px-6 py-3.5 text-sm font-bold shadow-xl shadow-indigo-500/25 w-full md:w-48"
            >
              🔍 Find a ride
            </GradientButton>
            <button
              onClick={() => (window.location.href = "/rides/offer")}
              className="w-full md:w-48 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              🚗 Offer a ride
            </button>
            <Link to="/my-bookings" className="w-full md:w-48">
              <button className="w-full rounded-xl border border-white/15 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white/80 backdrop-blur transition hover:bg-white/15">
                📋 My bookings
              </button>
            </Link>
          </div>
        </div>
      </section>

      {error ? <div className="text-sm text-rose-600">{error}</div> : null}


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total bookings" value={bookings.filter((b) => b.status !== "CANCELLED").length} icon={Calendar} tone="indigo" />
        <Stat label="Unread notifications" value={unreadCount} icon={Users} tone="blue" />
        <Stat label="Rating" value={"4.9"} icon={Star} tone="amber" />
        <Stat label="CO₂ saved" value={"85kg"} icon={Leaf} tone="green" />
      </div>

      {/* ═══════════════════════════════════════════════════
          HOW SHAREFARE WORKS — 3-step guide
      ═══════════════════════════════════════════════════ */}
      <section className="py-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5" /> How It Works
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Three steps to smarter commuting
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            ShareFare makes carpooling effortless for Hyderabad's college community
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12, duration: 0.5 }}
              className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:-translate-y-1"
            >
              {/* Step number */}
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white text-sm font-bold shadow-lg shadow-indigo-500/15`}>
                {item.step}
              </div>

              {/* Icon */}
              <div className={`mt-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.bgColor}`}>
                <item.icon className={`h-6 w-6 ${item.textColor}`} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>

              {/* Connector arrow on non-last items */}
              {idx < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-5 w-5 text-slate-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY SHAREFARE — Feature cards
      ═══════════════════════════════════════════════════ */}
      <section className="py-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600 shadow-sm mb-3">
            <Star className="h-3.5 w-3.5" /> Why ShareFare
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Built for students, by students
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Everything you need for safe, affordable, and eco-friendly campus commuting
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`rounded-2xl border p-5 transition hover:shadow-md hover:-translate-y-1 ${feature.color}`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.iconColor}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-950">{feature.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          OUR PURPOSE — mission section
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-12 shadow-2xl">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-10 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />
        
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur mb-4">
            <Heart className="h-3.5 w-3.5 text-rose-400" /> Our Mission
          </div>
          <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">
            Making every campus commute
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent"> affordable, safe, and green</span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/65">
            ShareFare was born from a simple idea: Hyderabad's 300,000+ college students shouldn't commute alone.
            We connect verified campus riders heading the same way, so everyone saves money, stays safe, and reduces their carbon footprint.
            No commission, no middlemen — just students helping students.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <MapPin className="h-4 w-4 text-indigo-300" /> Hyderabad
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <Users className="h-4 w-4 text-indigo-300" /> 50k+ Riders
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <Leaf className="h-4 w-4 text-emerald-300" /> Eco-Friendly
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> 100% Verified
            </div>
          </div>
        </div>
      </section>


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
                    onClick={() => void handleNotificationClick(n)}
                    className={`rounded-2xl border p-4 transition cursor-pointer hover:bg-slate-50/60 ${
                      n.read ? "border-slate-200 bg-white hover:border-slate-300" : "border-indigo-200 bg-indigo-50/30 hover:border-indigo-300"
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

          <Card title="My Drives" subtitle="Manage rides you offered">
              <div className="flex flex-wrap items-center gap-2">
                <GradientButton onClick={() => (window.location.href = "/offered-rides")}>View all drives</GradientButton>
                <GradientButton variant="ghost" onClick={() => (window.location.href = "/ride-requests")}>Ride requests</GradientButton>
                <GradientButton variant="ghost" onClick={() => (window.location.href = "/rides/offer")}>Offer another</GradientButton>
                {isAdmin ? <GradientButton variant="ghost" onClick={() => (window.location.href = "/admin")}>Admin dashboard</GradientButton> : null}
              </div>
              {driverRides.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {driverRides.map((r) => (
                    <Link key={r.id} to={`/rides/${r.id}`} className="block">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50 hover:border-indigo-200 hover:shadow-sm">
                        <div className="text-sm font-semibold text-slate-950">{r.origin.split(",")[0]} → {r.destination.split(",")[0]}</div>
                        <div className="mt-1 text-xs text-slate-500">{new Date(r.departureTime).toLocaleString()}</div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Seats: {r.seatsAvailable}/{r.seatsTotal}</span>
                          <span className="inline-flex items-center gap-1"><BadgeIndianRupee className="h-3.5 w-3.5" /> {r.pricePerSeat}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            r.status === "OPEN" ? "bg-blue-100 text-blue-700" :
                            r.status === "COMPLETED" ? "bg-slate-100 text-slate-600" :
                            r.status === "CANCELLED" ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>{r.status}</span>
                        </div>
                      </div>
                    </Link>
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
              <Link to="/my-bookings">
                <GradientButton className="w-full" variant="secondary">My bookings</GradientButton>
              </Link>
              <Link to="/offered-rides">
                <GradientButton className="w-full" variant="secondary">My Drives</GradientButton>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
