import { useEffect, useMemo, useRef, useState } from "react";
import { searchPlaces, PlaceResult } from "../lib/geocode";
import { Input } from "./Input";

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
      <Input
        value={value}
        onChange={(e) => onValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
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
      {busy ? (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          Searching…
        </div>
      ) : null}
      {open && results.length > 0 ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-lg backdrop-blur">
          {results.map((r, idx) => (
            <button
              key={`${r.lat}-${r.lng}-${idx}`}
              type="button"
              onClick={() => select(r)}
              className="block w-full border-b border-white/60 px-4 py-3 text-left text-sm text-slate-800 hover:bg-white last:border-b-0"
            >
              {r.displayName}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

