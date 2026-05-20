import { useEffect, useState } from "react";
import { cn } from "../lib/cn";

type ToastType = "success" | "error" | "info";
type ToastPayload = { message: string; type?: ToastType };
type ToastItem = ToastPayload & { id: number };

export function toast(message: string, type: ToastType = "info") {
  window.dispatchEvent(new CustomEvent<ToastPayload>("sharefare:toast", { detail: { message, type } }));
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent<ToastPayload>).detail;
      const id = Date.now();
      setItems((current) => [...current, { id, message: detail.message, type: detail.type ?? "info" }]);
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 3200);
    }
    window.addEventListener("sharefare:toast", onToast);
    return () => window.removeEventListener("sharefare:toast", onToast);
  }, []);

  return (
    <div className="fixed right-4 top-20 z-50 grid w-[calc(100vw-2rem)] max-w-sm gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "rounded-2xl border bg-white px-4 py-3 text-sm font-medium shadow-lg",
            item.type === "success" && "border-emerald-200 text-emerald-800",
            item.type === "error" && "border-rose-200 text-rose-800",
            item.type === "info" && "border-slate-200 text-slate-700"
          )}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
