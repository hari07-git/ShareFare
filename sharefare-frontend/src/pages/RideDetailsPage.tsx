import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { toast } from "../components/Toast";
import { distanceKm, estimateEtaMinutes } from "../lib/route";
import { RouteMapCard } from "../components/RideDetailsSections";
import { LiveRideTracker } from "../components/LiveRideTracker";
import { motion } from "framer-motion";
import {
  ArrowLeft, Shield, ShieldCheck, Star, Clock, Users, MapPin,
  Car, Phone, BadgeCheck, Zap, AlertTriangle, ChevronRight,
  BadgeIndianRupee, Leaf, CheckCircle2
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
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sz} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
      ))}
    </span>
  );
}

function RideDetailsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 rounded-3xl bg-slate-200" />
      <div className="h-32 rounded-2xl bg-slate-100" />
      <div className="h-64 rounded-2xl bg-slate-100" />
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
      setError(err?.response?.data?.message ?? "Failed to load ride");
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
      navigate("/me/bookings");
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-4">
        <Link to="/rides/find" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to rides
        </Link>
      </div>
      <RideDetailsSkeleton />
    </div>
  );

  if (error || !ride) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link to="/rides/find" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to rides
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-rose-400" />
          <div className="text-sm font-semibold text-rose-700">{error ?? "Ride not found"}</div>
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
    <div className="mx-auto max-w-4xl pb-32">
      {/* Back nav */}
      <div className="mb-4">
        <Link to="/rides/find" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="h-4 w-4" /> Back to rides
        </Link>
      </div>

      {/* Hero driver card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl md:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_60%)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Driver info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-black backdrop-blur ring-2 ring-white/20">
                {ride.driverGender === "FEMALE" ? "👩‍🎓" : driverInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold">{ride.driverName}</div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                {avgRating && (
                  <span className="flex items-center gap-1">
                    <StarRating rating={Math.round(parseFloat(avgRating))} />
                    <span className="text-sm font-semibold text-amber-300">{avgRating}</span>
                  </span>
                )}
                {ride.driverGender === "FEMALE" && (
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-200 ring-1 ring-purple-400/30">Female</span>
                )}
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                  <BadgeCheck className="inline h-3 w-3 mr-0.5" />Verified Student
                </span>
              </div>
              {/* Trust score */}
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${trustScore}%` }} />
                </div>
                <span className="text-xs text-white/60">Trust {trustScore}/100</span>
              </div>
            </div>
          </div>

          {/* Route summary */}
          <div className="flex flex-col gap-2 sm:items-end sm:text-right">
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-semibold">{ride.origin}</span>
            </div>
            <div className="flex items-center gap-2 text-white/40 text-xs self-start sm:self-end">
              <div className="ml-1.5 h-4 border-l border-dashed border-white/20" />
              {distance ? `${distance.toFixed(1)} km · ${eta} min` : "route preview"}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shrink-0" />
              <span className="font-semibold">{ride.destination}</span>
            </div>
          </div>
        </div>

        {/* Key stats row */}
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Clock, label: "Departure", value: new Date(ride.departureTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
            { icon: Users, label: "Seats left", value: `${ride.seatsAvailable} / ${ride.seatsTotal}` },
            { icon: BadgeIndianRupee, label: "Per seat", value: `₹${ride.pricePerSeat}` },
            { icon: Car, label: "Vehicle", value: ride.vehicleType ?? "Not specified" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-white/8 px-3 py-3 backdrop-blur">
              <Icon className="h-3.5 w-3.5 text-white/50" />
              <div className="mt-1 text-sm font-bold text-white">{value}</div>
              <div className="text-[11px] text-white/50">{label}</div>
            </div>
          ))}
        </div>

        {/* Ride tags */}
        <div className="relative mt-4 flex flex-wrap gap-2">
          {ride.status === "OPEN" && <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">🟢 Open</span>}
          {ride.status === "FULL" && <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300">🟡 Full</span>}
          {ride.status === "CANCELLED" && <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300">🔴 Cancelled</span>}
          {ride.femalePreferred && <span className="rounded-full bg-purple-500/20 px-2.5 py-1 text-xs font-semibold text-purple-200">♀ Female preferred</span>}
          {ride.verifiedOnly && <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-200"><Shield className="inline h-3 w-3 mr-0.5" />Verified only</span>}
          {ride.vehicleNumber && <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/70">{ride.vehicleNumber}</span>}
        </div>
      </motion.div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="p-4 border-b border-slate-100">
          <div className="text-sm font-bold text-slate-900">Route Map</div>
          <div className="text-xs text-slate-500 mt-0.5">Pickup → Drop preview</div>
        </div>
        <RouteMapCard pickup={pickup} drop={drop} distance={distance} eta={eta} />
      </motion.div>

      {/* Live Tracker */}
      <LiveRideTracker pickup={pickup} drop={drop} active={ride.status !== "CANCELLED"} />

      {/* Pickup note */}
      {ride.pickupNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
        >
          <MapPin className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-amber-900">Pickup note</div>
            <div className="mt-1 text-sm text-amber-700">{ride.pickupNote}</div>
          </div>
        </motion.div>
      )}

      {/* Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900">Ratings & Reviews</div>
            <div className="text-xs text-slate-500">{reviews.length} reviews</div>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(parseFloat(avgRating))} size="md" />
              <span className="text-2xl font-bold text-slate-950">{avgRating}</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-xl bg-slate-50 py-8 text-center">
            <Star className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <div className="text-sm text-slate-500">No reviews yet. Be the first!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                      {r.reviewerEmail.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{r.reviewerEmail.split("@")[0]}</span>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                {r.comment && <div className="mt-2 text-sm text-slate-700">{r.comment}</div>}
                <div className="mt-1 text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
            ))}
          </div>
        )}

        {auth.token && (hasCompletedBooking || isDriver) && (
          <div id="review-section" className="mt-5 border-t border-slate-100 pt-5">
            {alreadyReviewed ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" strokeWidth={2.5} />
                <span className="text-sm font-medium">You have already submitted a review for this ride. Thank you!</span>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-slate-900 mb-3">Leave a review</div>
                <div className="space-y-3">
                  {isDriver ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Passenger Email to Review</label>
                      <input
                        type="email"
                        value={revieweeEmail}
                        onChange={(e) => setRevieweeEmail(e.target.value)}
                        placeholder="Passenger email (reviewee)"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-200 flex flex-wrap items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-slate-600">Reviewing driver:</span>
                      <span className="text-sm font-bold text-slate-950 truncate">{ride.driverName}</span>
                      <span className="text-xs font-medium text-slate-400 truncate">({ride.driverEmail})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} type="button" onClick={() => setRating(i)}>
                          <Star className={`h-6 w-6 transition ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-200"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience (optional)"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none"
                  />
                  <GradientButton onClick={submitReview} className="w-full">Submit Review</GradientButton>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Sticky Booking CTA */}
      <div className={cn(
        "fixed left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 px-4 py-4 md:px-8 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4",
        auth.token ? "bottom-[57px] md:bottom-0" : "bottom-0"
      )}>
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <div className="flex-1">
            <div className="text-xs text-slate-500">Price per seat</div>
            <div className="text-2xl font-bold text-slate-950">₹{ride.pricePerSeat}</div>
          </div>

          {/* Seat selector */}
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
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-xl font-bold text-indigo-600">₹{total}</div>
          </div>

          {canBook ? (
            <GradientButton onClick={book} disabled={booking} className="px-6 py-3 text-base font-bold">
              {booking ? "Booking..." : "Book now"}
            </GradientButton>
          ) : !auth.token ? (
            <Link to="/auth/login">
              <GradientButton className="px-6 py-3">Login to book</GradientButton>
            </Link>
          ) : (
            <div className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-400">
              {isCancelled ? "Cancelled" : "Fully booked"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
