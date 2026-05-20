import { ShieldAlert, Share2, UserRoundPlus } from "lucide-react";
import { Button } from "./Button";
import { toast } from "./Toast";

export function SOSButton() {
  return (
    <Button variant="danger" onClick={() => toast("SOS mode: call your emergency contact or local emergency services immediately.", "error")}>
      <ShieldAlert className="mr-2 inline h-4 w-4" />
      SOS
    </Button>
  );
}

export function ShareTripButton() {
  async function shareTrip() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "ShareFare trip", url });
      return;
    }
    await navigator.clipboard?.writeText(url);
    toast("Trip link copied.", "success");
  }

  return (
    <Button variant="secondary" onClick={() => void shareTrip()}>
      <Share2 className="mr-2 inline h-4 w-4" />
      Share trip
    </Button>
  );
}

export function EmergencyContactForm() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <UserRoundPlus className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-950">Emergency contact</div>
          <div className="text-xs text-slate-500">Add a trusted contact for live trip sharing.</div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          placeholder="Contact name"
        />
        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          placeholder="+91 phone number"
        />
      </div>
    </div>
  );
}

export const EmergencyContactCard = EmergencyContactForm;
