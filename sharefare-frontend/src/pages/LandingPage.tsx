import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { GradientButton } from "../components/GradientButton";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { DarkMap } from "../components/DarkMap";
import {
  ArrowRight, BadgeIndianRupee, Calendar, Clock3, MapPin,
  Navigation, ShieldCheck, Sparkles, Star, Users, BadgeCheck, Zap, Search,
  ChevronDown, ChevronUp, Shield, Lock, Car, Heart
} from "lucide-react";
import { useMemo, useState } from "react";
import { PlaceResult } from "../lib/geocode";
import { distanceKm, estimateEtaMinutes } from "../lib/route";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";

const routes = [
  { from: "JNTU College", to: "HITEC City", price: "₹55", seats: "3 seats", riders: "24 riders" },
  { from: "Gachibowli", to: "Madhapur", price: "₹45", seats: "2 seats", riders: "18 riders" },
  { from: "Kukatpally Metro", to: "Financial District", price: "₹85", seats: "4 seats", riders: "31 riders" },
  { from: "Secunderabad", to: "Gachibowli", price: "₹90", seats: "2 seats", riders: "19 riders" }
];

const defaultPickup = { lat: 17.4448, lng: 78.3498 };
const defaultDrop = { lat: 17.4483, lng: 78.3915 };

const STATS = [
  { value: "50k+", label: "Campus riders", icon: Users },
  { value: "4.9★", label: "Average rating", icon: Star },
  { value: "₹35", label: "Avg fare saved", icon: BadgeIndianRupee },
  { value: "Live", label: "Route tracking", icon: Navigation }
];

const TRUST_PILLS = [
  { label: "Verified Students Only", icon: BadgeCheck, color: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30" },
  { label: "Zero Commission", icon: Zap, color: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30" },
  { label: "Safety First", icon: ShieldCheck, color: "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30" },
];

export function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [fromPick, setFromPick] = useState<PlaceResult | null>(null);
  const [toPick, setToPick] = useState<PlaceResult | null>(null);

  const pickup = fromPick ? { lat: fromPick.lat, lng: fromPick.lng } : defaultPickup;
  const drop = toPick ? { lat: toPick.lat, lng: toPick.lng } : defaultDrop;
  const distance = distanceKm(pickup, drop);
  const eta = estimateEtaMinutes(distance);

  const nearby = useMemo(
    () => [
      { lat: 17.437, lng: 78.366 },
      { lat: 17.456, lng: 78.382 },
      { lat: 17.432, lng: 78.392 }
    ],
    []
  );

  function search() {
    const params = new URLSearchParams();
    if (fromPick?.displayName || from.trim()) params.set("origin", (fromPick?.displayName ?? from).trim());
    if (toPick?.displayName || to.trim()) params.set("destination", (toPick?.displayName ?? to).trim());
    if (date) params.set("date", date);
    navigate(`/rides/find?${params.toString()}`);
  }

  const handleRouteClick = async (fromVal: string, toVal: string) => {
    try {
      const res = await api.get(`/api/rides/search?origin=${encodeURIComponent(fromVal)}&destination=${encodeURIComponent(toVal)}&size=5`);
      if (res.data && res.data.content && res.data.content.length > 0) {
        // Redirect to the first specific ride details page
        const firstRide = res.data.content[0];
        navigate(`/rides/${firstRide.id}`);
      } else {
        // Fallback to the search results page
        navigate(`/rides/find?origin=${encodeURIComponent(fromVal)}&destination=${encodeURIComponent(toVal)}`);
      }
    } catch (err) {
      console.error("Error searching for route rides:", err);
      navigate(`/rides/find?origin=${encodeURIComponent(fromVal)}&destination=${encodeURIComponent(toVal)}`);
    }
  };

  return (
    <div className="space-y-12 overflow-hidden">

      {/* ═══════════════════════════════════════════════════
          HERO SECTION — cinematic dark with carpool image
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Background image */}
        <div className="absolute inset-0 sf-hero-carpool" />

        {/* Bottom gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />

        {/* Subtle purple glow top-right */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl" />

        <div className="relative grid min-h-[540px] items-center gap-8 px-6 py-12 sm:px-10 md:py-16 lg:grid-cols-[1fr_400px] lg:px-14">

          {/* LEFT — headline + trust pills + stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              Hyderabad's #1 verified campus mobility network
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
              Move smarter.<br />
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Travel verified.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
              ShareFare connects Hyderabad college students for affordable, safe carpools. Every rider is campus-verified. Every route is real.
            </p>

            {/* Trust pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {TRUST_PILLS.map((p) => (
                <span key={p.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur ${p.color}`}>
                  <p.icon className="h-3.5 w-3.5" />
                  {p.label}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <GradientButton onClick={() => navigate(token ? "/home" : "/rides/find")} className="px-6 py-3 text-base font-bold shadow-lg shadow-indigo-500/25">
                {token ? "Open dashboard" : "Find a ride"} <ArrowRight className="h-4 w-4" />
              </GradientButton>
              <button
                onClick={() => navigate(token ? "/rides/offer" : "/auth/register")}
                className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                {token ? "Offer a ride" : "Create account"}
              </button>
            </div>

            {/* Floating stats row */}
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map(({ value, label, icon: Icon }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur transition"
                >
                  <Icon className="h-4 w-4 text-indigo-300" />
                  <div className="mt-2 text-xl font-bold text-white">{value}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-white/60">{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — glass ride planner card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.12 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
              {/* Card glow */}
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />

              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-white">Plan a ride</div>
                    <div className="mt-0.5 text-xs text-white/60">Live suggestions · Route preview</div>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                    {eta ?? 18} min ETA
                  </div>
                </div>

                <div className="space-y-2.5">
                  <LocationAutocomplete value={from} onValue={setFrom} placeholder="Pickup: Gachibowli, campus, metro..." onSelect={setFromPick} />
                  <LocationAutocomplete value={to} onValue={setTo} placeholder="Drop: HITEC City, JNTU, Secunderabad..." onSelect={setToPick} />
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-indigo-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm font-medium text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  <GradientButton className="w-full py-3 font-bold shadow-lg shadow-indigo-500/20" onClick={search}>
                    Search live rides <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                </div>

                {/* Map preview */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/20">
                  <DarkMap pickup={pickup} drop={drop} nearby={nearby} height={200} />
                </div>

                {/* Route stats */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { icon: MapPin, value: `${distance?.toFixed(1) ?? "–"} km`, label: "distance" },
                    { icon: Clock3, value: `${eta ?? "–"} min`, label: "ETA" },
                    { icon: ShieldCheck, value: "Verified", label: "students" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={label} className="rounded-xl border border-white/15 bg-white/10 p-2.5 text-center">
                      <Icon className="mx-auto h-3.5 w-3.5 text-indigo-300" />
                      <div className="mt-1 text-xs font-bold text-white">{value}</div>
                      <div className="text-[10px] text-white/50">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          POPULAR ROUTES SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="py-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm">
            <Zap className="h-3.5 w-3.5" /> Live routes
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Popular Hyderabad<br />campus corridors
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            High-frequency verified routes connecting colleges, metro, and tech parks daily.
          </p>
          <Link to="/rides/find" className="mt-5 inline-flex">
            <GradientButton variant="ghost">Explore all rides <ArrowRight className="h-4 w-4" /></GradientButton>
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {routes.map((route, i) => (
            <motion.div
              key={`${route.from}-${route.to}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -16px rgba(99,102,241,0.18)" }}
              onClick={() => handleRouteClick(route.from, route.to)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all"
            >
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 font-semibold text-slate-950">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-300" />
                  {route.from}
                </div>
                <div className="ml-1 h-4 border-l border-dashed border-slate-200" />
                <div className="flex items-center gap-2 font-semibold text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-sm shadow-violet-300" />
                  {route.to}
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
                <div>
                  <div className="text-2xl font-black text-slate-950">{route.price}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{route.seats} available</div>
                </div>
                <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition group-hover:border-indigo-200 group-hover:bg-indigo-100">
                  {route.riders}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY STUDENTS USE SHAREFARE (FEATURES SECTION)
      ═══════════════════════════════════════════════════ */}
      <section className="py-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-655 shadow-xs mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Features
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Why students use ShareFare
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-normal">
            Built for safe, affordable, and verified campus commuting.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Verified Students",
              desc: "Every rider is manually verified using college ID approval.",
              gradient: "from-emerald-450 to-teal-500"
            },
            {
              icon: Navigation,
              title: "Smart Route Matching",
              desc: "Find rides between colleges, metro stations, and campuses instantly.",
              gradient: "from-blue-500 to-indigo-600"
            },
            {
              icon: Users,
              title: "Safe Community Travel",
              desc: "Verified profiles, ratings, and booking approvals increase trust.",
              gradient: "from-violet-500 to-purple-600"
            },
            {
              icon: BadgeIndianRupee,
              title: "Affordable Daily Commute",
              desc: "Share travel costs and reduce daily transportation expenses.",
              gradient: "from-amber-400 to-orange-500"
            },
            {
              icon: Search,
              title: "Live Route Preview",
              desc: "Preview pickup and destination routes before booking.",
              gradient: "from-sky-400 to-indigo-500"
            },
            {
              icon: Zap,
              title: "Mobile Friendly",
              desc: "Smooth responsive experience for phones, tablets, and desktops.",
              gradient: "from-rose-500 to-pink-500"
            }
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/20 bg-white/45 backdrop-blur-md p-5 shadow-3xs hover:shadow-xs hover:bg-white/75 transition-all duration-300"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-sm`}>
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3.5 text-sm font-black text-slate-955">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-650 font-semibold">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW SHAREFARE WORKS (HOW IT WORKS SECTION)
      ═══════════════════════════════════════════════════ */}
      <section className="py-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-655 shadow-xs mb-3">
            <Zap className="h-3.5 w-3.5" /> Guide
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-955 sm:text-3xl">
            How ShareFare works
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto leading-normal">
            A secure campus network built to get you moving in 3 quick steps.
          </p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {/* Animated Connecting Line on desktop */}
          <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-slate-200" />

          {[
            {
              step: "01",
              title: "Verify Account",
              desc: "Upload your college ID and get approved.",
              icon: BadgeCheck,
              gradient: "from-blue-600 to-indigo-605"
            },
            {
              step: "02",
              title: "Find or Offer Ride",
              desc: "Search available rides or publish your own route.",
              icon: Search,
              gradient: "from-violet-600 to-purple-650"
            },
            {
              step: "03",
              title: "Travel Together",
              desc: "Book securely and coordinate with verified students.",
              icon: Users,
              gradient: "from-emerald-500 to-teal-600"
            }
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12, duration: 0.5 }}
              className="relative text-center rounded-2xl bg-white/30 border border-slate-200/60 p-5 flex flex-col items-center"
            >
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md border border-slate-100">
                <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-slate-905 border-2 border-white font-mono text-[10px] font-black text-white flex items-center justify-center">
                  {item.step}
                </span>
              </div>
              <h3 className="mt-4 text-xs font-black text-slate-900">{item.title}</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-normal max-w-xs font-semibold">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          BUILT WITH STUDENT SAFETY FIRST (SAFETY SECTION)
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 shadow-xl text-white">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-10 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-indigo-300">
              <Shield className="h-3.5 w-3.5 text-indigo-400" /> Security Audit
            </div>
            <h2 className="text-2xl font-black leading-tight sm:text-3xl lg:text-4xl tracking-tight">
              Built with student safety first
            </h2>
            <p className="text-sm leading-relaxed text-slate-350 font-medium">
              We understand campus commuting safety is paramount. ShareFare restricts account activation to verified email domains and college identities. Every ride request and routing is transparently tracked.
            </p>
            
            {/* Glowing safety badges */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {[
                "Verified Student-Only",
                "Admin ID Approval",
                "Secure Bookings",
                "Reviews & Ratings",
                "Female Commuter Filters"
              ].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 text-[10px] font-black tracking-wide text-slate-200 transition"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Glowing Verification Card */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-650 blur-xl opacity-20" />
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur space-y-3 shadow-2xl">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">Identity Verified</h4>
                  <span className="text-[9px] text-slate-400 font-bold">Updated just now</span>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="space-y-2 text-[11px] font-semibold text-slate-300">
                <div className="flex justify-between">
                  <span>Student ID Status</span>
                  <span className="text-emerald-400 font-black">VALIDATED</span>
                </div>
                <div className="flex justify-between">
                  <span>Domain Approval</span>
                  <span className="text-indigo-400">@edu domains only</span>
                </div>
                <div className="flex justify-between">
                  <span>Routing Encrypted</span>
                  <span className="text-indigo-400 font-black">SSL SECURE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS SECTION (ANIMATED STATISTICS)
      ═══════════════════════════════════════════════════ */}
      <section className="py-2.5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: "Verified Students", target: 12500, suffix: "+", icon: Users, tone: "from-blue-500 to-indigo-550" },
            { label: "Total Rides Completed", target: 45000, suffix: "+", icon: Car, tone: "from-violet-500 to-purple-650" },
            { label: "Routes Active", target: 180, suffix: "+", icon: Navigation, tone: "from-sky-500 to-blue-600" },
            { label: "Average Savings", target: 3200, prefix: "₹", suffix: "/mo", icon: BadgeIndianRupee, tone: "from-emerald-500 to-teal-600" }
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-3xs transition hover:-translate-y-0.5"
            >
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${stat.tone} text-white shadow-2xs`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
              <div className="mt-3 text-[9px] font-black uppercase tracking-wider text-slate-400">{stat.label}</div>
              <div className="mt-1 text-2xl font-black text-slate-905 tracking-tight">
                <AnimatedCounter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STUDENT TESTIMONIALS (AUTO-SCROLL MARQUEE CAROUSEL)
      ═══════════════════════════════════════════════════ */}
      <section className="py-4 overflow-hidden relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-655 shadow-xs mb-3">
            <Heart className="h-3.5 w-3.5 text-rose-500" /> Testimonials
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Commuter Experiences
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto leading-normal font-semibold">
            Hear from students across Hyderabad carpooling daily.
          </p>
        </div>

        {/* Marquee Wrapper */}
        <div className="relative w-full overflow-hidden py-1">
          {/* Side Fades */}
          <div className="absolute top-0 bottom-0 left-0 w-8 md:w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-8 md:w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-4 w-[200%] animate-marquee hover:[animation-play-state:paused]">
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 25s linear infinite;
              }
            `}</style>

            {/* Testimonials List (duplicated for loop effect) */}
            {Array.from({ length: 2 }).map((_, loopIdx) => (
              <div key={loopIdx} className="flex gap-4 w-1/2 justify-around">
                {[
                  {
                    name: "Neha S.",
                    college: "CBIT student",
                    text: "ShareFare has made my daily commute from Kukatpally to CBIT so much easier. I've met awesome people from other batches!",
                    rating: 5,
                    avatar: "NS"
                  },
                  {
                    name: "Rahul K.",
                    college: "Woxsen University",
                    text: "As a driver, I split my fuel costs between Gachibowli and Woxsen. Highly recommend the verification system.",
                    rating: 5,
                    avatar: "RK"
                  },
                  {
                    name: "Anjali D.",
                    college: "BITS Hyderabad",
                    text: "The female-preferred filter makes night commutes from campuses feel completely safe. It's an essential app.",
                    rating: 5,
                    avatar: "AD"
                  },
                  {
                    name: "Vikram M.",
                    college: "JNTUH student",
                    text: "Saved almost ₹3,000 this month alone compared to cabs. It's zero commission and 100% student-focused!",
                    rating: 5,
                    avatar: "VM"
                  }
                ].map((t, idx) => (
                  <div
                    key={idx}
                    className="w-72 md:w-80 shrink-0 rounded-2xl border border-slate-200 bg-white p-4.5 shadow-3xs space-y-3 whitespace-normal flex flex-col justify-between"
                  >
                    <p className="text-xs text-slate-750 italic leading-relaxed font-semibold">"{t.text}"</p>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-extrabold flex items-center justify-center text-[10px] shadow-3xs">
                          {t.avatar}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-900 leading-none">{t.name}</h4>
                          <span className="text-[8px] text-slate-500 font-bold mt-1 block leading-none">{t.college}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, s) => (
                          <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ACCORDION FAQ SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="py-4 max-w-2xl mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-655 shadow-xs mb-2">
            <Sparkles className="h-3.5 w-3.5" /> FAQ
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase tracking-wide">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="border-t border-slate-200">
          {[
            {
              question: "How do I sign up?",
              answer: "Click the Register button in the top menu and enter your student credentials. Be sure to use your student domain email if available!"
            },
            {
              question: "How do I book a ride?",
              answer: "Visit Find Ride page, search your pickup and drop, open ride details, choose seats count and send request."
            },
            {
              question: "How are students verified?",
              answer: "Upload your college ID photo from the profile settings. Our admins review the card details and university records before verifying."
            },
            {
              question: "Can female students filter rides?",
              answer: "Yes. Drivers can toggle female-preferred ride pools, and female passengers can filter specifically for those rides when booking."
            },
            {
              question: "Is ShareFare free to use?",
              answer: "Absolutely! There are zero platform commissions. Passengers divide exact fuel and parking costs directly with drivers."
            },
            {
              question: "How do ride requests work?",
              answer: "When booking a seat, drivers receive approval cards with verification details. Once they Accept, contact details are shared."
            }
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-indigo-600/10 border border-indigo-200/50 p-8 text-center max-w-xl mx-auto">
        <h3 className="text-lg font-black text-slate-950">Ready to save on your daily commute?</h3>
        <p className="text-xs text-slate-655 mt-1 font-semibold">Join verified student carpoolers inside Hyderabad today.</p>
        <div className="mt-4 flex justify-center gap-3">
          <GradientButton onClick={() => navigate(token ? "/home" : "/auth/register")} className="px-6 py-2.5 text-xs font-bold shadow-md shadow-indigo-500/15">
            {token ? "Dashboard" : "Register Free"}
          </GradientButton>
        </div>
      </section>

    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HELPER UTILITY COMPONENTS FOR LANDING PAGE
═══════════════════════════════════════════════════ */
function AnimatedCounter({ target, duration = 1200, prefix = "", suffix = "" }: { target: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200/80 py-3.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-xs py-1.5 focus:outline-none"
      >
        <span>{question}</span>
        <span className="text-indigo-650 font-black text-xs transition-transform duration-300">
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>
      <div
        className={cn(
          "transition-all duration-300 overflow-hidden text-[11px] text-slate-550 leading-relaxed font-semibold",
          isOpen ? "max-h-40 mt-2 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {answer}
      </div>
    </div>
  );
}
