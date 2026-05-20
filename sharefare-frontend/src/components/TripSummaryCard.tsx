export function TripSummaryCard({
  origin,
  destination,
  departureTime,
  seats,
  total
}: {
  origin: string;
  destination: string;
  departureTime: string;
  seats: number;
  total: number;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <div className="font-semibold text-slate-950">Trip summary</div>
      <div className="mt-3 space-y-2 text-slate-600">
        <div className="flex justify-between gap-4"><span>Route</span><span className="text-right font-medium text-slate-950">{origin} → {destination}</span></div>
        <div className="flex justify-between gap-4"><span>Departure</span><span className="text-right">{new Date(departureTime).toLocaleString()}</span></div>
        <div className="flex justify-between gap-4"><span>Seats</span><span>{seats}</span></div>
        <div className="flex justify-between gap-4 border-t border-slate-200 pt-2 font-semibold text-slate-950"><span>Total</span><span>₹{total}</span></div>
      </div>
    </div>
  );
}
