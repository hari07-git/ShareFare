import { Button } from "./Button";

export type NotificationTab = "all" | "bookings" | "rides" | "safety" | "system";

export type NotificationItemModel = {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function UnreadBadge({ count }: { count: number }) {
  if (!count) return null;
  return <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{count}</span>;
}

export function NotificationTabs({
  value,
  counts,
  onChange
}: {
  value: NotificationTab;
  counts: Record<NotificationTab, number>;
  onChange: (tab: NotificationTab) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {(["all", "bookings", "rides", "safety", "system"] as NotificationTab[]).map((tab) => (
        <button
          key={tab}
          className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
            value === tab ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          onClick={() => onChange(tab)}
        >
          {tab === "rides" ? "Ride updates" : tab}
          <UnreadBadge count={counts[tab]} />
        </button>
      ))}
    </div>
  );
}

export function NotificationItem({
  item,
  busy,
  onMarkRead
}: {
  item: NotificationItemModel;
  busy: boolean;
  onMarkRead: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${
        item.read ? "border-slate-200 bg-white" : "border-blue-100 bg-blue-50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
        <div className="text-xs text-slate-600">{new Date(item.createdAt).toLocaleString()}</div>
      </div>
      <div className="mt-2 text-sm text-slate-700">{item.message}</div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs capitalize text-slate-500">Type: {item.type.replaceAll("_", " ").toLowerCase()}</div>
        {!item.read ? (
          <Button variant="secondary" disabled={busy} onClick={onMarkRead}>
            {busy ? "Marking..." : "Mark as read"}
          </Button>
        ) : (
          <span className="text-xs font-semibold text-emerald-700">Read</span>
        )}
      </div>
    </div>
  );
}
