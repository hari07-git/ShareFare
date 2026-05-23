import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { toast } from "../components/Toast";
import { distanceKm, estimateEtaMinutes } from "../lib/route";
import { RouteMapCard } from "../components/RideDetailsSections";
import { motion } from "framer-motion";
import {
  ArrowLeft, Shield, ShieldCheck, Star, Clock, Users, MapPin,
  Car, Phone, BadgeCheck, BadgeIndianRupee, CheckCircle2,
  AlertTriangle, DollarSign, Calendar
} from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { cn } from "../lib/cn";

type Ride = {
  id: number;
  driverEmail: string;
  driverName: string;
  driverPhone: string | null;
  driverGender: string | null;
  driverTrustScore: number | null;
  origin: string;
  destination: string;
  originLat: number | null;
  originLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
  departureTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  pricePerSeat: number;
  status: string;
  vehicleType: string | null;
  vehicleNumber: string | null;
  pickupNote: string | null;
  femalePreferred: boolean;
  verifiedOnly: boolean;
  safetyLevel: string | null;
};

type Review = {
  id: number;
  rideId: number;
  reviewerEmail: string;
  revieweeEmail: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex gap-0.5 animate-in fade-in duration-300">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sz} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
    </span>
  );
}

function RideDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto px-4 sm:px-6">
      <div className="h-40 rounded-3xl bg-slate-100" />
      <div className="h-14 rounded-2xl bg-slate-100" />
      <div className="h-80 rounded-3xl bg-slate-100" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-50" />
        ))}
      </div>
    </div>
  );
}

export function RideDetailsPage() {
  const { rideId } = useParams();
  const [searchParams] = useSearchParams();
  const isReviewQuery = searchParams.get("review") === "true";

  const [ride, setRide] = useState<Ride | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seats, setSeats] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [revieweeEmail, setRevieweeEmail] = useState("");
  const [booking, setBooking] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const auth = useAuth();
  const navigate = useNavigate();

  async function load() {
    if (!rideId) return;
    setLoading(true);
    setError(null);
    try {
      const [rideRes, reviewRes] = await Promise.all([
        api.get<Ride>(`/api/rides/${rideId}`),
        api.get<Review[]>(`/api/rides/${rideId}/reviews`),
      ]);
      setRide(rideRes.data);
      setReviews(reviewRes.data);
      if (auth.token) {
        const bookingsRes = await api.get<any[]>("/api/me/bookings");
        setUserBookings(bookingsRes.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load ride details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [rideId]);

  useEffect(() => {
    if (ride && auth.me) {
      const isDriver = auth.me.email.toLowerCase() === ride.driverEmail.toLowerCase();
      if (!isDriver) {
        setRevieweeEmail(ride.driverEmail);
      }
    }
  }, [ride, auth.me]);

  useEffect(() => {
    if (ride && isReviewQuery) {
      const timer = setTimeout(() => {
        const element = document.getElementById("review-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [ride, isReviewQuery]);

  async function book() {
    if (!rideId) return;
    setBooking(true);
    try {
      await api.post(`/api/rides/${rideId}/bookings`, { seats });
      toast("Booking request sent! 🎉", "success");
      navigate("/my-bookings");
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Booking failed", "error");
    } finally {
      setBooking(false);
    }
  }

  async function submitReview() {
    if (!rideId || !ride) return;
    const isDriver = auth.me?.email?.toLowerCase() === ride.driverEmail.toLowerCase();
    const targetEmail = isDriver ? revieweeEmail : ride.driverEmail;
    if (!targetEmail) {
      toast("Please specify a reviewee email", "error");
      return;
    }
    try {
      await api.post(`/api/rides/${rideId}/reviews`, {
        revieweeEmail: targetEmail,
        rating,
        comment: comment.trim() || null,
      });
      toast("Review submitted!", "success");
      setRevieweeEmail("");
      setRating(5);
      setComment("");
      await load();
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Review failed", "error");
    }
  }

  if (loading) return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6 px-4">
        <Link to="/rides/find" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to rides
        </Link>
      </div>
      <RideDetailsSkeleton />
    </div>
  );

  if (error || !ride) {
    return (
      <div className="mx-auto max-w-4xl py-6 px-4">
        <Link to="/rides/find" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to rides
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center backdrop-blur shadow">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-rose-400 animate-bounce" />
          <div className="text-sm font-bold text-rose-700">{error ?? "Ride not found"}</div>
        </div>
      </div>
    );
  }

  const pickup = ride.originLat != null && ride.originLng != null ? { lat: ride.originLat, lng: ride.originLng } : null;
  const drop = ride.destinationLat != null && ride.destinationLng != null ? { lat: ride.destinationLat, lng: ride.destinationLng } : null;
  const distance = distanceKm(pickup, drop);
  const eta = estimateEtaMinutes(distance);
  const subtotal = ride.pricePerSeat * seats;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;
  const trustScore = Math.round((ride.driverTrustScore ?? 5) * 10);
  const driverInitials = ride.driverName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  const isFull = ride.seatsAvailable <= 0;
  const isCancelled = ride.status === "CANCELLED";
  const canBook = !isFull && !isCancelled && auth.token;

  const isDriver = auth.me?.email?.toLowerCase() === ride.driverEmail.toLowerCase();
  const hasCompletedBooking = userBookings.some((b) => b.rideId === ride.id && b.status === "COMPLETED");
  const alreadyReviewed = reviews.some((r) => r.reviewerEmail.toLowerCase() === auth.me?.email?.toLowerCase());

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-32 pt-4">
      {/* Back Nav Link */}
      <div className="mb-6">
        <Link to="/rides/find" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="h-4 w-4" /> Back to rides
        </Link>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: Spacious Premium Driver Safety Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 select-none rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 font-black text-white flex items-center justify-center text-lg shadow ring-2 ring-white">
              {driverInitials}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow">
                <ShieldCheck className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-950 flex items-center gap-2 flex-wrap">
                {ride.driverName}
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black tracking-wider text-emerald-700 uppercase border border-emerald-100">
                  Verified Student
                </span>
                {ride.driverGender && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200">
                    {ride.driverGender}
                  </span>
                )}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>BITS Hyderabad Commuter</span>
                {avgRating && (
                  <span className="flex items-center gap-1">
                    • <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-slate-900">{avgRating} Rating</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2 border-t sm:border-t-0 border-slate-100 pt-3.5 sm:pt-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">BITS Trust Score</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${trustScore}%` }} />
              </div>
              <span className="text-xs font-extrabold text-slate-900">{trustScore}%</span>
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: Clean Spacious Route Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-md"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">A</div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pickup Point</span>
                  <span className="text-sm font-bold text-slate-900">{ride.origin}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">B</div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drop Location</span>
                  <span className="text-sm font-bold text-slate-900">{ride.destination}</span>
                </div>
              </div>
            </div>

            {ride.pickupNote && (
              <div className="w-full md:w-80 rounded-2xl bg-amber-50 p-4 border border-amber-200/50 flex gap-2">
                <MapPin className="h-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="block text-xs font-extrabold text-amber-900 uppercase tracking-wider">Pickup Notes</span>
                  <p className="mt-0.5 text-xs text-amber-700 leading-relaxed">{ride.pickupNote}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* SECTION 3: Single Premium Interactive Map */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md relative"
        >
          <RouteMapCard pickup={pickup} drop={drop} distance={distance} eta={eta} />
        </motion.div>

        {/* SECTION 4: Premium Ride Key Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Clock, label: "Departure Time", value: new Date(ride.departureTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
            { icon: Users, label: "Seats Available", value: `${ride.seatsAvailable} / ${ride.seatsTotal} Open` },
            { icon: BadgeIndianRupee, label: "Split Cost per seat", value: `₹${ride.pricePerSeat}` },
            { icon: Car, label: "Ride Vehicle", value: ride.vehicleType ?? "Not specified" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-slate-300">
              <div className="p-2 rounded-xl bg-slate-50 inline-block text-indigo-600 mb-2">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="text-sm font-extrabold text-slate-900">{value}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* SECTION 5: Booking Cost Summary Panel (Sticky footer links also exist) */}
        {auth.token && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-6 flex flex-col md:flex-row gap-6 justify-between items-center"
          >
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Fare breakdown preview</h4>
              <p className="text-xs text-slate-600">Calculated based on BITS Hyderabad carpool cost-sharing ratios.</p>
              <div className="mt-3 flex gap-6 text-xs text-slate-600 font-semibold border-t border-slate-200 pt-2.5">
                <span>Seats: <span className="text-slate-900 font-bold">{seats}</span></span>
                <span>Split Subtotal: <span className="text-slate-900 font-bold">₹{subtotal}</span></span>
                <span>Platform fee: <span className="text-slate-900 font-bold">₹{fee}</span></span>
              </div>
            </div>

            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-200 pt-4 md:pt-0">
              <div className="text-right">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total split cost</span>
                <span className="text-2xl font-black text-indigo-700">₹{total}</span>
              </div>
              {canBook ? (
                <GradientButton onClick={book} disabled={booking} className="px-8 py-3 text-sm font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-md shadow-blue-500/10">
                  {booking ? "Submitting..." : "Send Join Request"}
                </GradientButton>
              ) : (
                <div className="rounded-xl bg-slate-200 px-6 py-3 text-xs font-bold text-slate-400">
                  {isCancelled ? "CANCELLED" : "FULLY BOOKED"}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SECTION 6: Ratings & Reviews Wall */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-950">Ratings & Community Reviews</h3>
              <p className="text-xs text-slate-500 mt-0.5">{reviews.length} reviews from BITS passengers</p>
            </div>
            {avgRating && (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(parseFloat(avgRating))} size="md" />
                <span className="text-2xl font-extrabold text-slate-950">{avgRating}</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 py-10 text-center border border-dashed border-slate-200/80">
              <Star className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">No student reviews logged yet.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {r.reviewerEmail.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{r.reviewerEmail.split("@")[0]}</span>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-slate-700 leading-relaxed">{r.comment}</p>}
                  <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
              ))}
            </div>
          )}

          {auth.token && (hasCompletedBooking || isDriver) && (
            <div id="review-section" className="mt-6 border-t border-slate-100 pt-6">
              {alreadyReviewed ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-850 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" strokeWidth={2.5} />
                  <span className="text-sm font-semibold">You have logged a feedback review for this travel commute. Thank you!</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900">Leave a review</h4>
                  {isDriver ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Passenger Email</label>
                      <input
                        type="email"
                        value={revieweeEmail}
                        onChange={(e) => setRevieweeEmail(e.target.value)}
                        placeholder="Rider BITS email address..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-200 flex flex-wrap items-center gap-2 min-w-0 text-sm">
                      <span className="font-semibold text-slate-600">Reviewing driver:</span>
                      <span className="font-bold text-slate-950 truncate">{ride.driverName}</span>
                      <span className="text-xs text-slate-400">({ride.driverEmail})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">Rating:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} type="button" onClick={() => setRating(i)}>
                          <Star className={`h-6 w-6 transition ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide details about the commute conduct, timing, pickup, etc..."
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none"
                  />
                  <GradientButton onClick={submitReview} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-md">
                    Submit Student Review
                  </GradientButton>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Sticky Bottom Booking CTA */}
      <div className={cn(
        "fixed left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 px-4 py-4 md:px-8 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4 transition-all duration-300",
        auth.token ? "bottom-[57px] md:bottom-0" : "bottom-0"
      )}>
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price per seat</div>
            <div className="text-xl sm:text-2xl font-black text-slate-950">₹{ride.pricePerSeat}</div>
          </div>

          {/* Seat Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              className="h-8 w-8 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm transition font-bold"
            >−</button>
            <span className="w-8 text-center text-sm font-bold text-slate-950">{seats}</span>
            <button
              onClick={() => setSeats((s) => Math.min(ride.seatsAvailable, s + 1))}
              className="h-8 w-8 rounded-lg text-slate-600 hover:bg-white hover:shadow-sm transition font-bold"
            >+</button>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total split</div>
            <div className="text-lg sm:text-xl font-extrabold text-indigo-600">₹{total}</div>
          </div>

          {canBook ? (
            <GradientButton onClick={book} disabled={booking} className="px-6 py-3 text-sm font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-md">
              {booking ? "Submitting..." : "Book now"}
            </GradientButton>
          ) : !auth.token ? (
            <Link to="/auth/login">
              <GradientButton className="px-6 py-3 text-xs font-bold bg-indigo-600 border-none shadow-sm">Login to book</GradientButton>
            </Link>
          ) : (
            <div className="rounded-xl bg-slate-100 px-6 py-3 text-xs font-bold text-slate-400">
              {isCancelled ? "Cancelled" : "Fully booked"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
