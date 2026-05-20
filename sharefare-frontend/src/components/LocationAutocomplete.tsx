import { useEffect, useMemo, useRef, useState } from "react";
import { searchPlaces, PlaceResult } from "../lib/geocode";
import { Input } from "./Input";
import { LocateFixed, MapPin } from "lucide-react";
import { cn } from "../lib/cn";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function LocationAutocomplete({
  value,
  onValue,
  placeholder,
  disabled,
  onSelect
}: {
  value: string;
  onValue: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onSelect: (place: PlaceResult) => void;
}) {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const debounced = useDebouncedValue(value, 250);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const canSearch = useMemo(() => debounced.trim().length >= 2, [debounced]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!canSearch || disabled) {
        setResults([]);
        setBusy(false);
        return;
      }
      setBusy(true);
      const res = await searchPlaces(debounced);
      if (cancelled) return;
      setResults(res);
      setBusy(false);
      setOpen(true);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [debounced, canSearch, disabled]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function select(place: PlaceResult) {
    onSelect(place);
    onValue(place.displayName);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-indigo-500" />
        <Input
          value={value}
          onChange={(e) => onValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-24"
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (results[0]) {
                e.preventDefault();
                select(results[0]);
              }
            }
            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <div
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-[11px] font-semibold text-slate-400",
            busy ? "text-indigo-600" : ""
          )}
        >
          <LocateFixed className="h-3.5 w-3.5" />
          {busy ? "Searching" : "GPS"}
        </div>
      </div>
      {busy ? (
        <div className="absolute left-4 right-4 top-full z-30 mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-300/70" />
        </div>
      ) : null}
      {open && results.length > 0 ? (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10">
          {results.map((r, idx) => (
            <button
              key={`${r.lat}-${r.lng}-${idx}`}
              type="button"
              onClick={() => select(r)}
              className="flex w-full gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50"
            >
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="line-clamp-2 leading-relaxed text-slate-700">{r.displayName}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
