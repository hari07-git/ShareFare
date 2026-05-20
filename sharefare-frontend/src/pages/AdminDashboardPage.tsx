import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";

type Metrics = {
  totalUsers: number;
  totalRides: number;
  totalBookings: number;
  confirmedBookings: number;
  activeRides: number;
  openSafetyReports: number;
  totalIncome: number;
  recentUsers: Array<{ id: number; email: string; fullName: string; role: string; collegeVerified: boolean; emailVerified: boolean }>;
  recentRides: Array<{ id: number; origin: string; destination: string; departureTime: string; seatsAvailable: number; status: string; driverEmail: string }>;
  recentBookings: Array<{ id: number; rideId: number; passengerEmail: string; seatsBooked: number; status: string }>;
};

export function AdminDashboardPage() {
  const { me } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const res = await api.get<Metrics>("/api/admin/metrics");
        setMetrics(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Failed to load admin metrics");
      }
    }
    void load();
  }, []);

  if (me?.role !== "ADMIN") {
    return (
      <Card title="Admin">
        <div className="text-sm text-slate-700">You are not authorized to view admin data.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        subtitle="Track bookings and revenue for the platform."
        imageUrl="/images/hyderabad-hitec-city.jpg"
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Card title="Admin dashboard">
          <div className="text-sm text-slate-700">
            Signed in as <span className="font-medium">{me.email}</span>
          </div>
          {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
        </Card>
        
        <Card title="Trust & Safety" className="min-w-[250px]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.location.href = '/admin/verification'}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              ID Verification Queue
            </button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["Users", metrics?.totalUsers],
          ["Rides", metrics?.totalRides],
          ["Bookings", metrics?.totalBookings],
          ["Active rides", metrics?.activeRides],
          ["Safety reports", metrics?.openSafetyReports],
          ["Income ₹", metrics?.totalIncome]
        ].map(([label, value]) => (
          <Card key={label as string} title={label as string}>
            <div className="text-3xl font-semibold text-slate-950">{value ?? "—"}</div>
            <div className="mt-1 text-sm text-slate-600">Operational metric</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Recent rides" subtitle="Ride moderation overview">
          <div className="space-y-3">
            {(metrics?.recentRides ?? []).map((ride) => (
              <div key={ride.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="font-semibold text-slate-950">{ride.origin} → {ride.destination}</div>
                <div className="mt-1 text-slate-600">{new Date(ride.departureTime).toLocaleString()} • {ride.seatsAvailable} seats</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-2 py-1 font-semibold text-slate-700">{ride.status}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-slate-600">{ride.driverEmail}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent bookings" subtitle="Booking lifecycle oversight">
          <div className="space-y-3">
            {(metrics?.recentBookings ?? []).map((booking) => (
              <div key={booking.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="font-semibold text-slate-950">Booking #{booking.id} • Ride #{booking.rideId}</div>
                <div className="mt-1 text-slate-600">{booking.passengerEmail}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span>{booking.seatsBooked} seat(s)</span>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">{booking.status.replace("_", " ")}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent users" subtitle="User moderation snapshot">
          <div className="space-y-3">
            {(metrics?.recentUsers ?? []).map((user) => (
              <div key={user.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="font-semibold text-slate-950">{user.fullName}</div>
                <div className="mt-1 text-slate-600">{user.email}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-2 py-1 font-semibold text-slate-700">{user.role}</span>
                  <span className={`rounded-full px-2 py-1 font-semibold ${user.collegeVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {user.collegeVerified ? "College verified" : "College pending"}
                  </span>
                  <span className={`rounded-full px-2 py-1 font-semibold ${user.emailVerified ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"}`}>
                    {user.emailVerified ? "Email verified" : "Email pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
