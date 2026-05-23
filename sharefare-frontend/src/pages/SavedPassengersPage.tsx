import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowLeft, Star, ShieldCheck, Mail, Phone, Trash2, CalendarClock, MessageSquare } from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { toast } from "../components/Toast";

type Commuter = {
  id: number;
  name: string;
  college: string;
  rating: number;
  completedRides: number;
  verified: boolean;
  phone: string;
};

const INITIAL_RIDERS: Commuter[] = [
  {
    id: 1,
    name: "Rohan Varma",
    college: "IIIT Hyderabad",
    rating: 4.9,
    completedRides: 18,
    verified: true,
    phone: "+91 98480 22334"
  },
  {
    id: 2,
    name: "Nisha Patel",
    college: "HCU (University of Hyderabad)",
    rating: 4.8,
    completedRides: 12,
    verified: true,
    phone: "+91 94405 66778"
  },
  {
    id: 3,
    name: "Aditya Roy",
    college: "JNTU Hyderabad",
    rating: 4.7,
    completedRides: 9,
    verified: true,
    phone: "+91 91234 56789"
  }
];

export function SavedPassengersPage() {
  const [riders, setRiders] = useState<Commuter[]>(INITIAL_RIDERS);

  const handleRemove = (id: number, name: string) => {
    setRiders(prev => prev.filter(r => r.id !== id));
    toast(`Removed ${name} from your Saved Riders.`, "success");
  };

  const handleInvite = (name: string) => {
    toast(`Quick booking invitation sent to ${name}! 🚗`, "success");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link to="/me/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            <Users className="h-3.5 w-3.5" /> Campus Network
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Saved Riders</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Manage your list of trusted commuters and favorite carpool partners. Invite them directly to new offered rides with a single tap.
          </p>
        </div>

        {riders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center space-y-3">
            <Users className="h-12 w-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-950">No saved riders yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Riders you save or frequently carpool with on Hyderabad campus routes will appear here for fast re-bookings.
            </p>
            <button
              onClick={() => setRiders(INITIAL_RIDERS)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition pt-2 block mx-auto"
            >
              Reset simulated list
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence>
              {riders.map((rider) => (
                <motion.div
                  key={rider.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-indigo-200 transition duration-300 relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      {/* Avatar & details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-sm uppercase">
                          {rider.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-950 truncate">{rider.name}</span>
                            {rider.verified && (
                              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <span className="block text-[11px] text-slate-500 truncate mt-0.5">{rider.college}</span>
                        </div>
                      </div>

                      {/* Trash action */}
                      <button
                        type="button"
                        onClick={() => handleRemove(rider.id, rider.name)}
                        className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50"
                        aria-label={`Remove ${rider.name}`}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Completed Trips</span>
                        <span className="font-bold text-slate-900 mt-0.5">{rider.completedRides} rides</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Rating</span>
                        <span className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {rider.rating}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 font-semibold pl-0.5">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {rider.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleInvite(rider.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition"
                    >
                      <CalendarClock className="h-3.5 w-3.5" /> Invite to ride
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
