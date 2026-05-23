import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { toast } from "../components/Toast";
import { distanceKm, estimateEtaMinutes } from "../lib/route";
import { DarkMap } from "../components/DarkMap";
import { motion } from "framer-motion";
import {
  ArrowLeft, Shield, ShieldCheck, Star, Clock, Users, MapPin,
  Car, Phone, BadgeIndianRupee, CheckCircle2, AlertTriangle, X
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
  driverCollegeName: string | null;
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
        <Star key={i} className={`${sz} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-250"}`} />
      ))}
    </span>
  );
}

function RideDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl mx-auto px-4 sm:px-6">
      <div className="h-32 rounded-3xl bg-slate-100" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 rounded-3xl bg-slate-100" />
          <div className="h-80 rounded-3xl bg-slate-100" />
          <div className="h-48 rounded-3xl bg-slate-100" />
        </div>
        <div className="h-96 rounded-3xl bg-slate-100" />
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
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'ROUTE' | 'DRIVER' | 'REVIEWS'>('ROUTE');
  const [showReviewModal, setShowReviewModal] = useState(false);
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
    <div className="mx-auto max-w-5xl py-6 px-4">
      <div className="mb-6">
        <Link to="/rides/find" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to rides
        </Link>
      </div>
      <RideDetailsSkeleton />
    </div>
  );

  if (error || !ride) {
    return (
      <div className="mx-auto max-w-5xl py-6 px-4">
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

  const reviewsToShow = showAllReviews ? reviews : reviews.slice(0, 2);
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-32 pt-3">
      {/* Back Nav Link */}
      <div className="mb-4">
        <Link to="/rides/find" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to rides
        </Link>
      </div>

      {/* SECTION 1: Premium Ride Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 select-none rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 font-black text-white flex items-center justify-center text-sm shadow ring-2 ring-white">
            {driverInitials}
            <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow">
              <ShieldCheck className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5 flex-wrap">
              {ride.driverName}
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.2 text-[8px] font-black tracking-wider text-emerald-700 uppercase border border-emerald-100">
                Verified
              </span>
              {ride.driverGender && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[8px] font-bold text-slate-600 border border-slate-200">
                  {ride.driverGender}
                </span>
              )}
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <span>Campus Commuter</span>
              {ride.driverCollegeName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-1.5 py-0.2 text-[8px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  🎓 {ride.driverCollegeName}
                </span>
              )}
              {avgRating && (
                <span className="flex items-center gap-0.5">
                  • <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900">{avgRating}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1 border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0">
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Campus Trust</span>
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-20 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${trustScore}%` }} />
            </div>
            <span className="text-[10px] font-extrabold text-slate-900">{trustScore}%</span>
          </div>
        </div>
      </motion.div>

      {/* TABS CONTROLLER (Tabbed view for Route, Driver details, and Reviews to save scrolling) */}
      <div className="mt-4 flex border-b border-slate-200 bg-slate-50/60 p-1 rounded-xl">
        {(["ROUTE", "DRIVER", "REVIEWS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveDetailsTab(tab)}
            className={`flex-1 rounded-lg py-2 text-center text-xs font-bold tracking-tight transition-all duration-200 ${
              activeDetailsTab === tab
                ? "bg-white text-indigo-650 shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "ROUTE" && "Route"}
            {tab === "DRIVER" && "Driver & Vehicle"}
            {tab === "REVIEWS" && `Reviews (${reviews.length})`}
          </button>
        ))}
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Ride Details (Depends on Active Tab) */}
        <div className="lg:col-span-2">
          
          {activeDetailsTab === "ROUTE" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Timeline stopping point */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Route Timeline</h4>
                <div className="relative pl-7 space-y-4">
                  {/* Vertical connector line */}
                  <div className="absolute left-3.5 top-2 bottom-2 w-0.5 border-l-2 border-dashed border-slate-200" />

                  {/* Start Stop */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-emerald-100">
                      <span className="h-1 w-1 rounded-full bg-white" />
                    </span>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pickup Location</span>
                      <p className="text-xs font-bold text-slate-950 mt-0.5">{ride.origin}</p>
                    </div>
                  </div>

                  {/* End Stop */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-600 ring-2 ring-indigo-100">
                      <span className="h-1 w-1 rounded-full bg-white" />
                    </span>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Destination Drop</span>
                      <p className="text-xs font-bold text-slate-950 mt-0.5">{ride.destination}</p>
                    </div>
                  </div>
                </div>

                {ride.pickupNote && (
                  <div className="mt-4 flex gap-2 rounded-xl bg-indigo-50/50 p-3 border border-indigo-100/30 text-[11px] text-indigo-900">
                    <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wider block text-[9px] text-indigo-750">Pickup Notes</span>
                      <p className="mt-0.5 text-indigo-700 font-semibold leading-normal">{ride.pickupNote}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                    <span className="text-[11px] font-bold text-slate-800">Route Map Preview</span>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded-full">OSRM Live</span>
                </div>
                <DarkMap pickup={pickup} drop={drop} height={260} />
              </div>
            </div>
          )}

          {activeDetailsTab === "DRIVER" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Clock, label: "Departure Time", value: new Date(ride.departureTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
                  { icon: Users, label: "Seats Occupancy", value: `${ride.seatsAvailable} of ${ride.seatsTotal} Open` },
                  { icon: BadgeIndianRupee, label: "Price / Seat", value: `₹${ride.pricePerSeat}` },
                  { icon: Car, label: "Ride Vehicle", value: ride.vehicleType ?? "Not specified" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                    <div className="p-1.5 rounded-lg bg-slate-50 inline-block text-indigo-600 mb-1.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
                    <div className="text-xs font-bold text-slate-950 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>

              {/* Commute and Vehicle details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commute details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Driver Phone Contact</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                      {ride.driverPhone ? ride.driverPhone : "Shared after booking is confirmed"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Vehicle Plate Registration</span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5 text-indigo-600" />
                      {ride.vehicleNumber ? ride.vehicleNumber : "Shared after driver updates profile"}
                    </p>
                  </div>
                </div>
                
                {/* Safety Guidelines */}
                <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-3 flex gap-2.5 text-amber-900 text-[11px] leading-relaxed">
                  <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold uppercase tracking-wider block text-[9px] text-amber-800">Campus Commute Preferences</span>
                    <p className="mt-0.5 text-amber-700 font-semibold">
                      This ride is subject to female preference: <span className="font-extrabold text-slate-950">{ride.femalePreferred ? "Yes (Female preferred)" : "No preference"}</span>. 
                      Verified students only: <span className="font-extrabold text-slate-950">{ride.verifiedOnly ? "Yes (Strict verification)" : "All students"}</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeDetailsTab === "REVIEWS" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Student Commute Reviews</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{reviews.length} reviews from campus passengers</p>
                  </div>
                  {avgRating && (
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={Math.round(parseFloat(avgRating))} />
                      <span className="text-base font-black text-slate-950">{avgRating}</span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 py-6 text-center border border-dashed border-slate-200/80">
                    <Star className="mx-auto mb-1.5 h-6 w-6 text-slate-300" />
                    <div className="text-[11px] font-semibold text-slate-500">No student reviews logged yet.</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reviewsToShow.map((r) => (
                      <div key={r.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                              {r.reviewerEmail.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-bold text-slate-900">{r.reviewerEmail.split("@")[0]}</span>
                          </div>
                          <StarRating rating={r.rating} />
                        </div>
                        {r.comment && <p className="mt-1.5 text-xs text-slate-700 leading-relaxed font-medium">{r.comment}</p>}
                        <div className="mt-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-wider">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                    ))}
                  </div>
                )}

                {reviews.length > 2 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    {showAllReviews ? "Show less reviews" : `View all reviews (${reviews.length})`}
                  </button>
                )}

                {auth.token && (hasCompletedBooking || isDriver) && !alreadyReviewed && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 text-white font-bold py-2 text-xs shadow-xs border-none hover:shadow-sm transition"
                  >
                    Add Commuter Feedback Review
                  </button>
                )}

                {alreadyReviewed && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-emerald-800 flex items-center gap-2 mt-4 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>You have logged feedback for this travel commute. Thank you!</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Airbnb-style floating sticky booking card (Desktop only) */}
        <div className="hidden lg:block lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-2xl font-black text-slate-950">₹{ride.pricePerSeat}</span>
                <span className="text-xs text-slate-500 font-semibold"> / seat</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {ride.seatsAvailable} seats left
              </span>
            </div>

            {/* Seat Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Seats</label>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-2">
                <span className="text-xs font-bold text-slate-700 pl-2">Number of Seats</span>
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => setSeats((s) => Math.max(1, s - 1))}
                    className="h-8 w-8 rounded-lg text-slate-650 hover:bg-slate-100 transition font-bold"
                  >−</button>
                  <span className="w-8 text-center text-sm font-bold text-slate-950">{seats}</span>
                  <button
                    onClick={() => setSeats((s) => Math.min(ride.seatsAvailable, s + 1))}
                    className="h-8 w-8 rounded-lg text-slate-650 hover:bg-slate-100 transition font-bold"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Cost Summary Breakdown */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (₹{ride.pricePerSeat} × {seats})</span>
                <span className="text-slate-900 font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform split fee (5%)</span>
                <span className="text-slate-900 font-bold">₹{fee}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-extrabold text-slate-950">
                <span>Total split amount</span>
                <span className="text-indigo-600 font-black text-lg">₹{total}</span>
              </div>
            </div>

            {/* Booking Action Button */}
            {canBook ? (
              <GradientButton
                onClick={book}
                disabled={booking}
                className="w-full py-3.5 text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-md shadow-blue-500/10 hover:shadow-lg transition"
              >
                {booking ? "Submitting..." : "Book Now"}
              </GradientButton>
            ) : !auth.token ? (
              <Link to="/auth/login" className="block">
                <GradientButton className="w-full py-3.5 text-sm font-bold bg-indigo-600 border-none shadow-sm">
                  Login to book
                </GradientButton>
              </Link>
            ) : (
              <div className="rounded-2xl bg-slate-100 py-3.5 text-center text-sm font-bold text-slate-400 border border-slate-200">
                {isCancelled ? "Ride Cancelled" : "Fully Booked"}
              </div>
            )}

            {/* Subtext info */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4 text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Campus Verified Route</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Free cancellation before driver confirmation</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MOBILE STICKY BOTTOM SHEET / BAR */}
      <div className={cn(
        "lg:hidden fixed left-0 right-0 z-35 border-t border-slate-200 bg-white/85 backdrop-blur-lg shadow-2xl px-4 py-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-all duration-300",
        auth.token ? "bottom-[44px]" : "bottom-0"
      )}>
        <div className="flex items-center justify-between gap-3">
          {/* Price & Seats indicator */}
          <div>
            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">Total ({seats} seat{seats > 1 ? "s" : ""})</span>
            <span className="text-base font-black text-indigo-600">₹{total}</span>
          </div>

          {/* Compact Seat Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              className="h-8 w-8 rounded-lg text-slate-650 hover:bg-white hover:shadow-xs transition font-bold"
            >−</button>
            <span className="w-6 text-center text-xs font-extrabold text-slate-950">{seats}</span>
            <button
              onClick={() => setSeats((s) => Math.min(ride.seatsAvailable, s + 1))}
              className="h-8 w-8 rounded-lg text-slate-655 hover:bg-white hover:shadow-xs transition font-bold"
            >+</button>
          </div>

          {/* Book Now Gradient CTA */}
          {canBook ? (
            <GradientButton onClick={book} disabled={booking} className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-md">
              {booking ? "Booking..." : "Book Now"}
            </GradientButton>
          ) : !auth.token ? (
            <Link to="/auth/login">
              <GradientButton className="px-5 py-2.5 text-xs font-bold bg-indigo-600 border-none shadow-sm">Login</GradientButton>
            </Link>
          ) : (
            <div className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-400 border border-slate-200">
              {isCancelled ? "Cancelled" : "Full"}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal Dialog */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-xs flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">Leave student feedback</h3>
              <button
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setShowReviewModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              {isDriver ? (
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Passenger Email</label>
                  <input
                    type="email"
                    value={revieweeEmail}
                    onChange={(e) => setRevieweeEmail(e.target.value)}
                    placeholder="Passenger email address..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-semibold text-slate-500">Reviewing driver:</span>
                  <span className="font-bold text-slate-950">{ride.driverName}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Rating:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} type="button" onClick={() => setRating(i)}>
                      <Star className={`h-5 w-5 transition ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-250 hover:text-amber-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comments</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comment about commute conduct, timing, safety..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none"
                />
              </div>

              <GradientButton
                onClick={async () => {
                  await submitReview();
                  setShowReviewModal(false);
                }}
                className="w-full py-2.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-650"
              >
                Submit Student Review
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
