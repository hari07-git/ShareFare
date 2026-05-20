import { CarFront } from "lucide-react";

export function DriverVehicleDetails() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <CarFront className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-950">Driver vehicle details</div>
          <div className="text-xs text-slate-500">Shown to riders after booking when you offer rides.</div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          placeholder="Vehicle model"
        />
        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          placeholder="Vehicle number"
        />
        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          placeholder="Color"
        />
      </div>
    </div>
  );
}
