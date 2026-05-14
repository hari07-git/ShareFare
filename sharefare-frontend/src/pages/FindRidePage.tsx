import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { RouteMapFilter } from "../components/RouteMapFilter";

type Ride = {
  id: number;
  origin: string;
  destination: string;
  departureTime: string;
  seatsAvailable: number;
  pricePerSeat: number;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export function FindRidePage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<Ride> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const params = useMemo(() => {
    const p: any = { page, size: 20 };
    if (origin.trim()) p.origin = origin.trim();
    if (destination.trim()) p.destination = destination.trim();
    if (date) p.date = date;
    return p;
  }, [origin, destination, date, page]);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.get<Page<Ride>>("/api/rides/search", { params });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load rides");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find a ride"
        subtitle="Search by source/destination or pin locations on the map. Hyderabad-first."
        imageUrl="https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1600&q=80"
      />
      <Card
        title="Find a ride"
        subtitle="Hyderabad-first search • filter by source, destination, and date"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <FormField label="Origin">
            <Input
              value={origin}
              onChange={(e) => {
                setPage(0);
                setOrigin(e.target.value);
              }}
              placeholder="Gachibowli"
            />
          </FormField>
          <FormField label="Destination">
            <Input
              value={destination}
              onChange={(e) => {
                setPage(0);
                setDestination(e.target.value);
              }}
              placeholder="Hitech City"
            />
          </FormField>
          <FormField label="Date">
            <Input value={date} onChange={(e) => { setPage(0); setDate(e.target.value); }} type="date" />
          </FormField>
          <div className="flex items-end">
            <Button type="button" variant="secondary" onClick={() => { setOrigin(""); setDestination(""); setDate(""); setPage(0); }}>
              Clear
            </Button>
          </div>
        </div>
        {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}
      </Card>

      <Card title="Map filter" subtitle="Pin source and destination (optional)">
        <RouteMapFilter
          originText={origin}
          destinationText={destination}
          onOriginText={setOrigin}
          onDestinationText={setDestination}
          onResetPage={() => setPage(0)}
        />
      </Card>

      <Card title="Available rides" subtitle="Tap a ride for details, booking, map pins, and reviews">
        {busy && !data ? <div className="text-sm text-slate-600">Loading...</div> : null}
        {data && data.content.length === 0 ? (
          <div className="text-sm text-slate-600">No rides found.</div>
        ) : null}
        <div className="space-y-3">
          {data?.content.map((r) => (
            <Link
              key={r.id}
              to={`/rides/${r.id}`}
              className="block rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm transition hover:bg-white/90"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">
                  {r.origin} → {r.destination}
                </div>
                <div className="text-sm text-slate-600">
                  Seats: {r.seatsAvailable} • ₹{r.pricePerSeat}
                </div>
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Departure: {new Date(r.departureTime).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>

        {data ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-slate-600">
              Page {data.number + 1} / {Math.max(1, data.totalPages)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={data.number <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                disabled={data.number + 1 >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
