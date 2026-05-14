import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { useAuth } from "../state/auth";

const heroImage =
  "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&w=1600&q=80";

const campusImage =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80";

export function LandingPage() {
  const { token } = useAuth();
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-10">
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Student-first • Safer • Cheaper
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
              Share rides around campus with people you can trust.
            </h1>
            <p className="mt-3 text-slate-700">
              ShareFare helps students and faculty find affordable rides, reduce traffic, and commute sustainably.
              Start with Hyderabad routes and grow from there.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {token ? (
                <>
                  <Link to="/home">
                    <Button>Go to home</Button>
                  </Link>
                  <Link to="/rides/find">
                    <Button variant="secondary">Find a ride</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/rides/find">
                    <Button>Find a ride</Button>
                  </Link>
                  <Link to="/rides/offer">
                    <Button variant="secondary">Offer a ride</Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button variant="secondary">Create account</Button>
                  </Link>
                </>
              )}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Typical savings</div>
                <div className="mt-1 text-lg font-semibold">30–60%</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Verified community</div>
                <div className="mt-1 text-lg font-semibold">Campus-only</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Less pollution</div>
                <div className="mt-1 text-lg font-semibold">More sharing</div>
              </div>
            </div>
          </div>
          <div className="relative min-h-[280px] md:min-h-full">
            <img src={heroImage} alt="City commute" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/90 p-4 backdrop-blur">
              <div className="text-sm font-medium">Try a Hyderabad route</div>
              <div className="mt-1 text-sm text-slate-700">
                Gachibowli → Hitech City • 8:30 AM • ₹60/seat
              </div>
              <div className="mt-2 text-xs text-slate-500">Tip: click a ride to book and review.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Safety-first">
          <p className="text-sm text-slate-700">
            Designed for campus communities. Use college emails and build trust with ratings and ride history.
          </p>
        </Card>
        <Card title="Smart matching">
          <p className="text-sm text-slate-700">
            Search rides by source/destination and date. Pin locations on the map when offering a ride.
          </p>
        </Card>
        <Card title="Admin oversight">
          <p className="text-sm text-slate-700">
            Admin dashboard tracks platform income and booking volume for operational visibility.
          </p>
        </Card>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-semibold">Built for real-world commuting</h2>
            <p className="mt-3 text-slate-700">
              Start simple: choose a source and destination in Hyderabad. Then add precise map pins for pickup and drop.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/rides/find">
                <Button variant="secondary">Explore rides</Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="secondary">Admin login</Button>
              </Link>
            </div>
          </div>
          <div className="relative min-h-[240px] md:min-h-full">
            <img src={campusImage} alt="Students" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}
