import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await api.get<Notification[]>("/api/me/notifications");
      setItems(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load notifications");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function markRead(id: number) {
    setBusy(id);
    try {
      await api.post(`/api/me/notifications/${id}/read`);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to mark read");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="All your booking updates in one place."
        imageUrl="https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1600&q=80"
      />
      <Card title="Latest updates" subtitle="Bookings, cancellations, and reminders">
        {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}
        {items.length === 0 ? <div className="text-sm text-slate-600">No notifications yet.</div> : null}

        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${
                n.read ? "border-white/50 bg-white/60" : "border-indigo-100 bg-indigo-50/70"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">{n.title}</div>
                <div className="text-xs text-slate-600">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-2 text-sm text-slate-700">{n.message}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-slate-500">Type: {n.type}</div>
                {!n.read ? (
                  <Button variant="secondary" disabled={busy === n.id} onClick={() => markRead(n.id)}>
                    {busy === n.id ? "Marking..." : "Mark as read"}
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700">Read</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
