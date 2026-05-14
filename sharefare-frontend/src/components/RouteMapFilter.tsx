import { useMemo, useState } from "react";
import { MapPicker } from "./MapPicker";
import { Button } from "./Button";
import { reverseGeocode } from "../lib/geocode";
import { LocationAutocomplete } from "./LocationAutocomplete";

type LatLng = { lat: number; lng: number };

export function RouteMapFilter({
  originText,
  destinationText,
  onOriginText,
  onDestinationText,
  onResetPage
}: {
  originText: string;
  destinationText: string;
  onOriginText: (v: string) => void;
  onDestinationText: (v: string) => void;
  onResetPage: () => void;
}) {
  const [originPin, setOriginPin] = useState<LatLng | null>(null);
  const [destinationPin, setDestinationPin] = useState<LatLng | null>(null);
  const [busy, setBusy] = useState<"o" | "d" | null>(null);

  const originCenter = useMemo(() => originPin ?? { lat: 17.385, lng: 78.4867 }, [originPin]);
  const destCenter = useMemo(() => destinationPin ?? { lat: 17.385, lng: 78.4867 }, [destinationPin]);

  async function pick(which: "o" | "d", p: LatLng) {
    onResetPage();
    if (which === "o") setOriginPin(p);
    else setDestinationPin(p);

    setBusy(which);
    const name = await reverseGeocode(p.lat, p.lng);
    if (name) {
      if (which === "o") onOriginText(name);
      else onDestinationText(name);
    } else {
      if (which === "o" && !originText.trim()) onOriginText(`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`);
      if (which === "d" && !destinationText.trim()) onDestinationText(`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`);
    }
    setBusy(null);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">Source pin</div>
          <div className="text-xs text-slate-600">{busy === "o" ? "Working..." : null}</div>
        </div>
        <div className="mb-3">
          <LocationAutocomplete
            value={originText}
            onValue={(v) => {
              onOriginText(v);
              onResetPage();
            }}
            placeholder="Type source (area/college)…"
            disabled={busy !== null}
            onSelect={(place) => {
              const p = { lat: place.lat, lng: place.lng };
              setOriginPin(p);
              onOriginText(place.displayName);
              onResetPage();
            }}
          />
        </div>
        <MapPicker
          value={originPin}
          onChange={(p) => void pick("o", p)}
          height={260}
          center={originCenter}
          zoom={13}
        />
        {originPin ? (
          <div className="mt-2 text-xs text-slate-600">
            Lat: {originPin.lat.toFixed(6)} • Lng: {originPin.lng.toFixed(6)}
          </div>
        ) : (
          <div className="mt-2 text-xs text-slate-600">Click the map to set a source pin.</div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">Destination pin</div>
          <div className="text-xs text-slate-600">{busy === "d" ? "Working..." : null}</div>
        </div>
        <div className="mb-3">
          <LocationAutocomplete
            value={destinationText}
            onValue={(v) => {
              onDestinationText(v);
              onResetPage();
            }}
            placeholder="Type destination (area/college)…"
            disabled={busy !== null}
            onSelect={(place) => {
              const p = { lat: place.lat, lng: place.lng };
              setDestinationPin(p);
              onDestinationText(place.displayName);
              onResetPage();
            }}
          />
        </div>
        <MapPicker
          value={destinationPin}
          onChange={(p) => void pick("d", p)}
          height={260}
          center={destCenter}
          zoom={13}
        />
        {destinationPin ? (
          <div className="mt-2 text-xs text-slate-600">
            Lat: {destinationPin.lat.toFixed(6)} • Lng: {destinationPin.lng.toFixed(6)}
          </div>
        ) : (
          <div className="mt-2 text-xs text-slate-600">Click the map to set a destination pin.</div>
        )}
      </div>

      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          Pins only help you fill source/destination text for now (API radius search can be added later).
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setOriginPin(null);
            setDestinationPin(null);
          }}
        >
          Clear pins
        </Button>
      </div>
    </div>
  );
}
