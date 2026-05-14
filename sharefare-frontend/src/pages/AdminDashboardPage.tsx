import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";

type Metrics = {
  totalBookings: number;
  confirmedBookings: number;
  totalIncome: number;
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
        imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
      />
      <Card title="Admin dashboard">
        <div className="text-sm text-slate-700">
          Signed in as <span className="font-medium">{me.email}</span>
        </div>
        {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Total bookings">
          <div className="text-3xl font-semibold">{metrics ? metrics.totalBookings : "—"}</div>
          <div className="mt-1 text-sm text-slate-600">All time</div>
        </Card>
        <Card title="Confirmed bookings">
          <div className="text-3xl font-semibold">{metrics ? metrics.confirmedBookings : "—"}</div>
          <div className="mt-1 text-sm text-slate-600">Revenue eligible</div>
        </Card>
        <Card title="Total income (₹)">
          <div className="text-3xl font-semibold">{metrics ? metrics.totalIncome : "—"}</div>
          <div className="mt-1 text-sm text-slate-600">Sum of confirmed seats × price</div>
        </Card>
      </div>
    </div>
  );
}
