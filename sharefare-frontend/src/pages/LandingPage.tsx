import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { GradientButton } from "../components/GradientButton";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { DarkMap } from "../components/DarkMap";
import {
  ArrowRight, BadgeIndianRupee, Calendar, Clock3, MapPin,
  Navigation, ShieldCheck, Sparkles, Star, Users, BadgeCheck, Zap, Search
} from "lucide-react";
import { useMemo, useState } from "react";
import { PlaceResult } from "../lib/geocode";
import { distanceKm, estimateEtaMinutes } from "../lib/route";
import { motion } from "framer-motion";

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
          HOW IT WORKS SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="py-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5" /> How It Works
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Commuting made <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">effortless</span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 max-w-lg mx-auto">
            Join thousands of Hyderabad college students already saving money and time with verified campus rides.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Search Your Route",
              desc: "Enter your college, metro, or destination. Instantly discover verified rides heading your way.",
              icon: Search,
              gradient: "from-indigo-500 to-blue-500",
              bg: "bg-indigo-50",
              text: "text-indigo-600"
            },
            {
              step: "02",
              title: "Book in One Click",
              desc: "Choose your preferred driver, schedule, and price. Secure your seat with a single tap.",
              icon: Calendar,
              gradient: "from-violet-500 to-purple-500",
              bg: "bg-violet-50",
              text: "text-violet-600"
            },
            {
              step: "03",
              title: "Ride & Save Together",
              desc: "Meet at the pickup, share the journey, split the costs. Save money and cut carbon emissions.",
              icon: Navigation,
              gradient: "from-emerald-500 to-teal-500",
              bg: "bg-emerald-50",
              text: "text-emerald-600"
            }
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12, duration: 0.5 }}
              className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md hover:-translate-y-1"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white text-sm font-bold shadow-lg`}>
                {item.step}
              </div>
              <div className={`mt-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.text}`} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              {idx < 2 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-5 w-5 text-slate-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY CHOOSE SHAREFARE
      ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-14 shadow-2xl">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-12 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur mb-3">
            <Star className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> Why ShareFare
          </div>
          <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
            The smart way to commute
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent"> across campus</span>
          </h2>
        </div>

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Verified Students", desc: "Every rider is campus-verified with college ID. Ride with peers, not strangers.", iconClr: "text-emerald-400" },
            { icon: Zap, title: "Zero Commission", desc: "We don't take a cut. Every rupee stays between riders. Fair and transparent.", iconClr: "text-amber-400" },
            { icon: Users, title: "Community First", desc: "Built for and by Hyderabad college students. A mobility network you can trust.", iconClr: "text-blue-400" },
            { icon: Navigation, title: "Eco-Friendly", desc: "Share rides, reduce emissions. Every carpool saves an average of 2.3kg CO₂.", iconClr: "text-emerald-400" }
          ].map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur transition hover:bg-white/15"
            >
              <f.icon className={`h-6 w-6 ${f.iconClr}`} />
              <h3 className="mt-3 text-sm font-bold text-white">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-white/60">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="relative mt-10 text-center">
          <GradientButton onClick={() => navigate(token ? "/home" : "/auth/register")} className="px-8 py-3.5 text-base font-bold shadow-lg shadow-indigo-500/25">
            {token ? "Open dashboard" : "Get started free"} <ArrowRight className="h-4 w-4" />
          </GradientButton>
        </div>
      </section>

    </div>
  );
}
