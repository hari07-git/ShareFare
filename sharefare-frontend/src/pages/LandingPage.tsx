import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { Glass } from "../components/Glass";
import { GradientButton } from "../components/GradientButton";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { LocationAutocomplete } from "../components/LocationAutocomplete";
import { ArrowRight, Leaf, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { PlaceResult } from "../lib/geocode";

export function LandingPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [fromPick, setFromPick] = useState<PlaceResult | null>(null);
  const [toPick, setToPick] = useState<PlaceResult | null>(null);

  const heroBg = useMemo(
    () =>
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=2200&q=80",
    []
  );

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#060a12]/50 shadow-[0_60px_160px_-110px_rgba(2,6,23,0.95)]">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050913]/60 via-[#050913]/55 to-[#050913]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_18%_18%,rgba(34,211,238,0.22),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(55%_55%_at_72%_22%,rgba(99,102,241,0.25),transparent_60%)]" />
        </div>

        <div className="relative grid items-stretch gap-8 px-6 py-10 md:grid-cols-12 md:px-10 md:py-12">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Trusted by campus commuters in Hyderabad
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
              Your Campus
              <span className="block sf-gradient-text">Ride Network</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200/90 md:text-lg">
              Connect with verified students. Share rides, split costs, and travel sustainably across Hyderabad.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {token ? (
                <>
                  <GradientButton onClick={() => navigate("/home")}>
                    Open dashboard <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                  <GradientButton variant="ghost" onClick={() => navigate("/rides/find")}>
                    Find rides
                  </GradientButton>
                </>
              ) : (
                <>
                  <GradientButton onClick={() => navigate("/rides/find")}>
                    Find rides <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                  <GradientButton variant="ghost" onClick={() => navigate("/auth/register")}>
                    Create account
                  </GradientButton>
                </>
              )}
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
              <Glass className="p-4">
                <div className="text-xs text-slate-300/90">Active students</div>
                <div className="mt-1 text-2xl font-semibold text-white">50k+</div>
              </Glass>
              <Glass className="p-4">
                <div className="text-xs text-slate-300/90">Universities</div>
                <div className="mt-1 text-2xl font-semibold text-white">500+</div>
              </Glass>
              <Glass className="p-4">
                <div className="text-xs text-slate-300/90">Rides completed</div>
                <div className="mt-1 text-2xl font-semibold text-white">2M+</div>
              </Glass>
              <Glass className="p-4">
                <div className="text-xs text-slate-300/90">Avg rating</div>
                <div className="mt-1 text-2xl font-semibold text-white">4.9★</div>
              </Glass>
            </div>
          </div>

          <div className="md:col-span-5">
            <Glass className="p-6 md:p-7">
              <div className="text-lg font-semibold text-white">Find your ride</div>
              <div className="mt-4 space-y-3">
                <LocationAutocomplete
                  value={from}
                  onValue={setFrom}
                  placeholder="Leaving from… (area/college)"
                  onSelect={(p) => setFromPick(p)}
                />
                <LocationAutocomplete
                  value={to}
                  onValue={setTo}
                  placeholder="Going to… (area/college)"
                  onSelect={(p) => setToPick(p)}
                />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="dd/mm/yyyy"
                />
                <GradientButton
                  className="w-full"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (fromPick?.displayName || from.trim()) params.set("origin", (fromPick?.displayName ?? from).trim());
                    if (toPick?.displayName || to.trim()) params.set("destination", (toPick?.displayName ?? to).trim());
                    if (date) params.set("date", date);
                    navigate(`/rides/find?${params.toString()}`);
                  }}
                >
                  Search rides <ArrowRight className="h-4 w-4" />
                </GradientButton>
                <div className="text-center text-xs text-slate-300/80">
                  Hyderabad-first • Suggestions while you type
                </div>
              </div>
            </Glass>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="text-center">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200/90">
            Why ShareFare?
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Built for Students
          </div>
          <div className="mt-2 text-sm text-slate-300/90">
            Designed for real mobility on campus routes in Hyderabad.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card title="Verified students" subtitle="Safer rides via college community">
            <div className="flex items-start gap-3 text-sm text-slate-200/90">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-300" />
              <p>Build trust with profiles, ratings, and ride history.</p>
            </div>
          </Card>
          <Card title="Save money" subtitle="Split costs, keep it fair">
            <div className="flex items-start gap-3 text-sm text-slate-200/90">
              <Zap className="mt-0.5 h-5 w-5 text-indigo-300" />
              <p>Smart matching and clear pricing per seat.</p>
            </div>
          </Card>
          <Card title="Eco-friendly" subtitle="Lower traffic, lower emissions">
            <div className="flex items-start gap-3 text-sm text-slate-200/90">
              <Leaf className="mt-0.5 h-5 w-5 text-emerald-300" />
              <p>Share rides and reduce carbon footprint.</p>
            </div>
          </Card>
          <Card title="Instant booking" subtitle="Book in seconds, get contact">
            <div className="flex items-start gap-3 text-sm text-slate-200/90">
              <Sparkles className="mt-0.5 h-5 w-5 text-sky-300" />
              <p>After booking, see driver contact and get updates.</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { from: "Gachibowli", to: "HITEC City", price: "₹59", riders: "24 riders" },
          { from: "Kukatpally", to: "JNTU College", price: "₹40", riders: "18 riders" },
          { from: "Miyapur", to: "Kondapur", price: "₹55", riders: "31 riders" },
          { from: "Secunderabad", to: "Ameerpet", price: "₹35", riders: "19 riders" }
        ].map((r) => (
          <Card key={`${r.from}-${r.to}`} className="hover:-translate-y-[2px] transition">
            <div className="flex items-center justify-between text-sm text-slate-200/90">
              <div>
                <div className="font-semibold text-white">{r.from}</div>
                <div className="mt-1 text-xs text-slate-300/80">{r.to}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-white">{r.price}</div>
                <div className="mt-1 text-xs text-slate-300/80">{r.riders}</div>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/rides/find" className="text-xs font-semibold text-cyan-200 hover:text-white">
                View routes →
              </Link>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card title="Create account" subtitle="Student or Driver">
          <p className="text-sm text-slate-200/90">
            Sign up with your email and choose your role. Drivers can offer rides and manage bookings.
          </p>
        </Card>
        <Card title="Find or offer rides" subtitle="Smart search + map pins">
          <p className="text-sm text-slate-200/90">
            Search by source, destination, and date — or offer rides with precise pickup/drop pins.
          </p>
        </Card>
        <Card title="Travel together" subtitle="Contact + notifications">
          <p className="text-sm text-slate-200/90">
            Book rides and get updates. Driver contact shows after booking for easy coordination.
          </p>
        </Card>
      </section>

      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-600/35 via-indigo-600/30 to-cyan-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_20%,rgba(255,255,255,0.20),transparent_65%)]" />
        <div className="relative px-6 py-10 md:px-10 md:py-12">
          <div className="text-center">
            <div className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Ready to start sharing?
            </div>
            <div className="mt-2 text-sm text-slate-100/90">
              Join students already saving money and travelling sustainably.
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <GradientButton onClick={() => navigate("/rides/find")}>Find a ride</GradientButton>
              <GradientButton variant="ghost" onClick={() => navigate("/rides/offer")}>
                Offer a ride
              </GradientButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
