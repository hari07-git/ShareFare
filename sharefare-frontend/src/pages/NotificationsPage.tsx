import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { toast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Car, ShieldCheck, Calendar, AlertTriangle, CheckCircle2,
  RefreshCw, MailOpen, Inbox, ChevronRight
} from "lucide-react";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type Tab = "all" | "bookings" | "rides" | "system";

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function notifIcon(type: string) {
  if (/booking/i.test(type)) return { icon: Calendar, color: "bg-indigo-100 text-indigo-600" };
  if (/ride|reminder|departure/i.test(type)) return { icon: Car, color: "bg-violet-100 text-violet-600" };
  if (/safety|sos|emergency/i.test(type)) return { icon: AlertTriangle, color: "bg-rose-100 text-rose-600" };
  if (/verif|approved|student/i.test(type)) return { icon: ShieldCheck, color: "bg-emerald-100 text-emerald-600" };
  return { icon: Bell, color: "bg-slate-100 text-slate-600" };
}

function EmptyNotifications({ tab }: { tab: Tab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-16 text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Inbox className="h-8 w-8 text-slate-400" />
      </div>
      <div className="text-base font-semibold text-slate-700">
        {tab === "all" ? "All caught up!" : `No ${tab} notifications`}
      </div>
      <div className="mt-1 text-sm text-slate-500">
        {tab === "all" ? "New updates will appear here" : `${tab.charAt(0).toUpperCase() + tab.slice(1)} updates will show here`}
      </div>
    </motion.div>
  );
}

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("all");

  const isBooking = (t: string) => /booking/i.test(t);
  const isRide = (t: string) => /ride|reminder|departure/i.test(t);
  const isSystem = (t: string) => !isBooking(t) && !isRide(t);

  const visible = tab === "bookings" ? items.filter((i) => isBooking(i.type))
    : tab === "rides" ? items.filter((i) => isRide(i.type))
    : tab === "system" ? items.filter((i) => isSystem(i.type))
    : items;

  const unreadCount = (subset: Notification[]) => subset.filter((i) => !i.read).length;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get<Notification[]>("/api/me/notifications");
      setItems(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => load(true), 30000);
    return () => clearInterval(id);
  }, [load]);

  async function markRead(id: number) {
    setBusyId(id);
    try {
      await api.post(`/api/me/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } finally {
      setBusyId(null);
    }
  }

  async function markAllRead() {
    try {
      await api.post("/api/me/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      toast("All notifications marked as read", "success");
    } catch {
      toast("Failed to mark all read", "error");
    }
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: unreadCount(items) },
    { id: "bookings", label: "Bookings", count: unreadCount(items.filter((i) => isBooking(i.type))) },
    { id: "rides", label: "Rides", count: unreadCount(items.filter((i) => isRide(i.type))) },
    { id: "system", label: "System", count: unreadCount(items.filter((i) => isSystem(i.type))) },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Notifications</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {unreadCount(items) > 0 ? `${unreadCount(items)} unread` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          {unreadCount(items) > 0 && (
            <Button variant="secondary" onClick={markAllRead} className="h-9 px-3 text-xs">
              <MailOpen className="h-3.5 w-3.5 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
              tab === t.id ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyNotifications tab={tab} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {visible.map((n, idx) => {
              const { icon: Icon, color } = notifIcon(n.type);
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                    n.read ? "border-slate-200" : "border-indigo-200 bg-indigo-50/30"
                  }`}
                >
                  {/* Unread indicator */}
                  {!n.read && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-indigo-500" />
                  )}
                  <div className="flex items-start gap-3 pl-1">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold text-slate-900 leading-snug">{n.title}</div>
                        <span className="shrink-0 text-xs text-slate-400">{relativeTime(n.createdAt)}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600 leading-relaxed">{n.message}</div>
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          disabled={busyId === n.id}
                          className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {busyId === n.id ? "Marking..." : "Mark as read"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
