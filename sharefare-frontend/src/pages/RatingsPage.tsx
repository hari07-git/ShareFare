import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowLeft, ShieldCheck, Award, MessageSquare, Heart, Clock, AlertTriangle } from "lucide-react";

type RatingReview = {
  id: number;
  reviewer: string;
  rating: number;
  comment: string;
  role: "rider" | "driver";
  date: string;
};

const SAMPLE_REVIEWS: RatingReview[] = [
  {
    id: 1,
    reviewer: "Priya Rao",
    rating: 5,
    comment: "Very punctual and polite driver! Drove extremely safely, vehicle was clean, and shared great playlists during the Kukatpally commute.",
    role: "driver",
    date: "May 18, 2026"
  },
  {
    id: 2,
    reviewer: "Karthik Pillai",
    rating: 5,
    comment: "Excellent co-traveler! Arrived at the Gachibowli pickup spot exactly on time and paid the split fuel costs instantly.",
    role: "rider",
    date: "May 14, 2026"
  },
  {
    id: 3,
    reviewer: "Neha Sen",
    rating: 5,
    comment: "Super accommodating driver. Adjusted coordinates slightly to drop me near my college gate during a heavy downpour.",
    role: "driver",
    date: "May 10, 2026"
  },
  {
    id: 4,
    reviewer: "Siddharth Jain",
    rating: 4,
    comment: "Friendly rider, had a great chat about Hyderabad campus placements during our route commute. Welcome back any time!",
    role: "rider",
    date: "May 06, 2026"
  }
];

export function RatingsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "rider" | "driver">("all");

  const filteredReviews = SAMPLE_REVIEWS.filter(rev => {
    return activeTab === "all" || rev.role === activeTab;
  });

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
            <Star className="h-3.5 w-3.5 fill-indigo-100" /> Trust Indicators
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ratings & Reviews</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Track your community standings, verified trust badges, and reviews given by university peer co-travelers.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Average Rating Big Card */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-indigo-50/20 p-5 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Rating</span>
            <div className="text-4xl font-black text-slate-950 mt-1 flex items-baseline">
              4.9<span className="text-base font-semibold text-slate-400">/5</span>
            </div>
            <div className="flex gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Excellent Community Standing</span>
          </div>

          {/* Operational Metrics Cards */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trips Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1 text-sm text-slate-700">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Completed</span>
                <span className="text-lg font-bold text-slate-950">39 rides</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Cancellation</span>
                <span className="text-lg font-bold text-slate-950">0%</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Safety Rating</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1 text-sm text-slate-700">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Safety score</span>
                <span className="text-lg font-bold text-emerald-600">10 / 10</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Verified</span>
                <span className="text-lg font-bold text-slate-950">Yes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          {([["all", "All Reviews"], ["rider", "As Passenger"], ["driver", "As Driver"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === id
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Reviews Logs */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredReviews.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
                No reviews found under this role criteria.
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <motion.div
                  key={rev.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 transition duration-200 hover:border-indigo-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                        {rev.reviewer.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-950 truncate block text-sm">{rev.reviewer}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {rev.role === "driver" ? "🚗 Driver Review" : "🎒 Passenger Review"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 pl-0.5">{rev.comment}</p>
                  <div className="text-[10px] text-slate-400 text-right pr-0.5">{rev.date}</div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
