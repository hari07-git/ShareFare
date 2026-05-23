import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { toast } from "../components/Toast";
import { DarkMap } from "../components/DarkMap";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, ShieldCheck, Star, Clock, Users, MapPin,
  Car, Phone, BadgeIndianRupee, CheckCircle2, AlertTriangle, X,
  MoreVertical, Pencil, Trash2, RefreshCw, Calendar, ChevronDown,
  Zap, TrendingUp, BadgeCheck
} from "lucide-react";
import { GradientButton } from "../components/GradientButton";
import { cn } from "../lib/cn";

/* ─────────────────── types ─────────────────── */

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

/* ─────────────────── small helpers ─────────────────── */

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sz} ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
    </span>
  );
}

function RideStatusBadge({ status, seatsAvailable }: { status: string; seatsAvailable: number }) {
  const badges: Record<string, { label: string; className: string }> = {
    ACTIVE:    { label: "Active",     className: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-400/30" },
    FULL:      { label: "Full",       className: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-400/30" },
    COMPLETED: { label: "Completed",  className: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-400/30" },
    CANCELLED: { label: "Cancelled",  className: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-400/30" },
    REPOSTED:  { label: "Reposted",   className: "bg-violet-50 text-violet-700 border-violet-200 ring-violet-400/30" },
  };
  const derived = seatsAvailable <= 0 && status === "ACTIVE" ? "FULL" : status;
  const { label, className } = badges[derived] ?? badges.ACTIVE;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide ring-1", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {label}
    </span>
  );
}

function RideDetailsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse max-w-5xl mx-auto px-4 sm:px-6">
      <div className="h-24 rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-36 rounded-2xl bg-slate-100" />
          <div className="h-64 rounded-2xl bg-slate-100" />
          <div className="h-40 rounded-2xl bg-slate-100" />
        </div>
        <div className="h-80 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

/* ─────────────────── confirmation modal ─────────────────── */

function ConfirmModal({
  open, title, description, confirmLabel, confirmClass,
  onConfirm, onCancel, loading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">{description}</p>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn("flex-1 rounded-xl py-2.5 text-xs font-black text-white transition shadow-sm", confirmClass ?? "bg-indigo-600 hover:bg-indigo-700", loading && "opacity-60 cursor-not-allowed")}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────── owner dropdown menu ─────────────────── */

function OwnerMenu({
  onEdit, onDelete, onRepost, rideStatus,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onRepost: () => void;
  rideStatus: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const isManageable = rideStatus === "ACTIVE" || rideStatus === "FULL";
  const isRestorable = rideStatus === "CANCELLED" || rideStatus === "COMPLETED";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
        aria-label="Ride actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-10 z-40 w-48 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl"
          >
            {isManageable && (
              <>
                <button
                  onClick={() => { setOpen(false); onEdit(); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Pencil className="h-3.5 w-3.5 text-indigo-500" />
                  Edit Ride Details
                </button>
                <button
                  onClick={() => { setOpen(false); onDelete(); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Ride
                </button>
              </>
            )}
            {isRestorable && (
              <button
                onClick={() => { setOpen(false); onRepost(); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Repost Ride
              </button>
            )}
            {!isManageable && !isRestorable && (
              <div className="px-4 py-3 text-[10px] text-slate-400 font-medium">No actions available</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── edit ride mini-form ─────────────────── */

function EditRideSheet({
  ride,
  onSave,
  onClose,
}: {
  ride: Ride;
  onSave: (updated: Ride) => void;
  onClose: () => void;
}) {
  const [departureTime, setDepartureTime] = useState(
    ride.departureTime ? ride.departureTime.slice(0, 16) : ""
  );
  const [pricePerSeat, setPricePerSeat] = useState(String(ride.pricePerSeat));
  const [seatsTotal, setSeatsTotal] = useState(String(ride.seatsTotal));
  const [vehicleType, setVehicleType] = useState(ride.vehicleType ?? "");
  const [vehicleNumber, setVehicleNumber] = useState(ride.vehicleNumber ?? "");
  const [pickupNote, setPickupNote] = useState(ride.pickupNote ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.put<Ride>(`/api/rides/${ride.id}`, {
        departureTime,
        pricePerSeat: parseFloat(pricePerSeat),
        seatsTotal: parseInt(seatsTotal),
        vehicleType: vehicleType || null,
        vehicleNumber: vehicleNumber || null,
        pickupNote: pickupNote || null,
      });
      toast("Ride updated successfully! ✅", "success");
      onSave(res.data);
      onClose();
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Update failed", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl pb-[env(safe-area-inset-bottom)]"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-950">Edit Ride</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Update departure time, pricing, or vehicle details</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Date/Time */}
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Calendar className="inline h-3 w-3 mr-1" />Departure Date & Time
            </label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
            />
          </div>

          {/* Price & Seats */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Price / Seat (₹)</label>
              <input
                type="number"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                min={1}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Seats</label>
              <input
                type="number"
                value={seatsTotal}
                onChange={(e) => setSeatsTotal(e.target.value)}
                min={1}
                max={8}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
              />
            </div>
          </div>

          {/* Vehicle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Vehicle Type</label>
              <input
                type="text"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="e.g. Swift, Alto"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Vehicle Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="TS 09 AB 1234"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
              />
            </div>
          </div>

          {/* Pickup note */}
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pickup Notes</label>
            <textarea
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
              rows={2}
              placeholder="Any instructions for passengers..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-black text-white shadow-md shadow-blue-500/20 hover:shadow-lg transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────── main page ─────────────────── */

export function RideDetailsPage() {
  const { rideId } = useParams();
  const [searchParams] = useSearchParams();
  const isReviewQuery = searchParams.get("review") === "true";

  const [ride, setRide] = useState<Ride | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking state
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [revieweeEmail, setRevieweeEmail] = useState("");
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<"ROUTE" | "DRIVER" | "REVIEWS">("ROUTE");

  // Owner actions
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reposting, setReposting] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  /* ── load ── */
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [rideId]);

  useEffect(() => {
    if (ride && auth.me) {
      const isDriver = auth.me.email.toLowerCase() === ride.driverEmail.toLowerCase();
      if (!isDriver) setRevieweeEmail(ride.driverEmail);
    }
  }, [ride, auth.me]);

  useEffect(() => {
    if (ride && isReviewQuery) {
      const timer = setTimeout(() => {
        document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [ride, isReviewQuery]);

  /* ── book ── */
  async function book() {
    if (!rideId) return;
    setBooking(true);
    try {
      await api.post(`/api/rides/${rideId}/bookings`, { seats });
      setBookingDone(true);
      toast("Booking request sent! 🎉", "success");
      // Refresh ride to get updated seat count
      const rideRes = await api.get<Ride>(`/api/rides/${rideId}`);
      setRide(rideRes.data);
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Booking failed", "error");
    } finally {
      setBooking(false);
    }
  }

  /* ── delete ── */
  async function deleteRide() {
    if (!rideId) return;
    setDeleting(true);
    try {
      await api.delete(`/api/rides/${rideId}`);
      toast("Ride deleted successfully", "success");
      navigate("/offered-rides");
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Delete failed", "error");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  /* ── repost ── */
  async function repostRide() {
    if (!rideId || !ride) return;
    setReposting(true);
    try {
      // Create a new ride using the same details
      await api.post("/api/rides", {
        origin: ride.origin,
        destination: ride.destination,
        originLat: ride.originLat,
        originLng: ride.originLng,
        destinationLat: ride.destinationLat,
        destinationLng: ride.destinationLng,
        departureTime: ride.departureTime,
        seatsTotal: ride.seatsTotal,
        pricePerSeat: ride.pricePerSeat,
        vehicleType: ride.vehicleType,
        vehicleNumber: ride.vehicleNumber,
        pickupNote: ride.pickupNote,
        femalePreferred: ride.femalePreferred,
        verifiedOnly: ride.verifiedOnly,
      });
      toast("Ride reposted successfully! 🚗", "success");
      navigate("/offered-rides");
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Repost failed", "error");
    } finally {
      setReposting(false);
      setShowRepostModal(false);
    }
  }

  /* ── review ── */
  async function submitReview() {
    if (!rideId || !ride) return;
    const isDriver = auth.me?.email?.toLowerCase() === ride.driverEmail.toLowerCase();
    const targetEmail = isDriver ? revieweeEmail : ride.driverEmail;
    if (!targetEmail) { toast("Please specify a reviewee email", "error"); return; }
    try {
      await api.post(`/api/rides/${rideId}/reviews`, {
        revieweeEmail: targetEmail, rating, comment: comment.trim() || null,
      });
      toast("Review submitted!", "success");
      setRevieweeEmail(""); setRating(5); setComment("");
      await load();
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Review failed", "error");
    }
  }

  /* ── derived ── */
  if (loading) return (
    <div className="mx-auto max-w-5xl py-6 px-4">
      <div className="mb-5">
        <Link to="/rides/find" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to rides
        </Link>
      </div>
      <RideDetailsSkeleton />
    </div>
  );

  if (error || !ride) return (
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

  const pickup = ride.originLat != null && ride.originLng != null ? { lat: ride.originLat, lng: ride.originLng } : null;
  const drop = ride.destinationLat != null && ride.destinationLng != null ? { lat: ride.destinationLat, lng: ride.destinationLng } : null;
  const subtotal = ride.pricePerSeat * seats;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;
  const trustScore = Math.round((ride.driverTrustScore ?? 5) * 10);
  const driverInitials = ride.driverName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const isFull = ride.seatsAvailable <= 0;
  const isCancelled = ride.status === "CANCELLED";
  const isCompleted = ride.status === "COMPLETED";
  const isActive = ride.status === "ACTIVE";
  const isOwner = auth.me?.email?.toLowerCase() === ride.driverEmail.toLowerCase();
  const hasCompletedBooking = userBookings.some((b) => b.rideId === ride.id && b.status === "COMPLETED");
  const alreadyReviewed = reviews.some((r) => r.reviewerEmail.toLowerCase() === auth.me?.email?.toLowerCase());
  const reviewsToShow = showAllReviews ? reviews : reviews.slice(0, 2);

  // Booking eligibility
  const canBook = !isOwner && isActive && !isFull && !isCancelled && !!auth.token && !bookingDone;

  /* ── booking CTA content ── */
  function BookingCTA({ compact = false }: { compact?: boolean }) {
    const btnBase = compact
      ? "px-5 py-2.5 text-xs font-black rounded-xl transition"
      : "w-full py-3.5 text-sm font-black rounded-2xl transition";

    if (!auth.token) return (
      <Link to="/auth/login" className={compact ? "" : "block"}>
        <button className={cn(btnBase, "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg")}>
          Login to Book
        </button>
      </Link>
    );

    if (isOwner) return (
      <button
        onClick={() => setShowEditSheet(true)}
        className={cn(btnBase, "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg flex items-center justify-center gap-2")}
      >
        <Pencil className="h-3.5 w-3.5" /> Edit My Ride
      </button>
    );

    if (bookingDone) return (
      <div className={cn(compact ? "px-5 py-2.5 rounded-xl" : "w-full py-3.5 rounded-2xl", "bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 text-emerald-700 font-black text-sm")}>
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        {compact ? "Requested!" : "Booking Request Sent!"}
      </div>
    );

    if (isCancelled) return (
      <div className={cn(compact ? "px-5 py-2.5 rounded-xl" : "w-full py-3.5 rounded-2xl", "bg-rose-50 border border-rose-200 flex items-center justify-center gap-1.5 text-rose-600 font-bold text-xs")}>
        <X className="h-3.5 w-3.5" /> Ride Cancelled
      </div>
    );

    if (isCompleted) return (
      <div className={cn(compact ? "px-5 py-2.5 rounded-xl" : "w-full py-3.5 rounded-2xl", "bg-blue-50 border border-blue-200 flex items-center justify-center gap-1.5 text-blue-600 font-bold text-xs")}>
        <CheckCircle2 className="h-3.5 w-3.5" /> Ride Completed
      </div>
    );

    if (isFull) return (
      <div className={cn(compact ? "px-5 py-2.5 rounded-xl" : "w-full py-3.5 rounded-2xl", "bg-amber-50 border border-amber-200 flex items-center justify-center gap-1.5 text-amber-700 font-bold text-xs")}>
        <Users className="h-3.5 w-3.5" /> Ride Full
      </div>
    );

    return (
      <button
        onClick={book}
        disabled={booking}
        className={cn(btnBase, "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2")}
      >
        {booking ? (
          <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Booking…</>
        ) : (
          <><Zap className="h-3.5 w-3.5" /> Book Now</>
        )}
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-28 lg:pb-8 pt-3">

      {/* ── Back + Status Bar ── */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link to="/rides/find" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to rides
        </Link>
        <div className="flex items-center gap-2">
          <RideStatusBadge status={ride.status} seatsAvailable={ride.seatsAvailable} />
          {isOwner && (
            <OwnerMenu
              rideStatus={isFull && isActive ? "FULL" : ride.status}
              onEdit={() => setShowEditSheet(true)}
              onDelete={() => setShowDeleteModal(true)}
              onRepost={() => setShowRepostModal(true)}
            />
          )}
        </div>
      </div>

      {/* ── Driver Header Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 font-black text-white flex items-center justify-center text-sm shadow ring-2 ring-white select-none">
              {driverInitials}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white shadow">
              <ShieldCheck className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5 flex-wrap">
              {ride.driverName}
              <span className="rounded-full bg-emerald-50 px-1.5 py-px text-[9px] font-extrabold tracking-wider text-emerald-700 uppercase border border-emerald-100">
                Verified
              </span>
              {ride.driverGender && (
                <span className="rounded-full bg-slate-100 px-1.5 py-px text-[9px] font-bold text-slate-600 border border-slate-200">
                  {ride.driverGender}
                </span>
              )}
              {isOwner && (
                <span className="rounded-full bg-indigo-50 px-1.5 py-px text-[9px] font-extrabold tracking-wider text-indigo-700 uppercase border border-indigo-100">
                  You
                </span>
              )}
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 flex-wrap">
              <span>Campus Commuter</span>
              {ride.driverCollegeName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-1.5 py-px text-[9px] font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
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

        {/* Trust + Departure */}
        <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-1 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
          <div>
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block sm:text-right">Campus Trust</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1 w-20 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${trustScore}%` }} />
              </div>
              <span className="text-[10px] font-extrabold text-slate-900">{trustScore}%</span>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block sm:text-right">Departure</span>
            <span className="text-[10px] font-bold text-slate-800">
              {new Date(ride.departureTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div className="flex bg-slate-50 border border-slate-200/80 rounded-xl p-1 gap-1 mb-4">
        {(["ROUTE", "DRIVER", "REVIEWS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-lg py-2 text-center text-xs font-bold tracking-tight transition-all duration-200",
              activeTab === tab
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {tab === "ROUTE" && "Route"}
            {tab === "DRIVER" && "Driver & Vehicle"}
            {tab === "REVIEWS" && `Reviews (${reviews.length})`}
          </button>
        ))}
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* LEFT: Tab Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* ROUTE TAB */}
            {activeTab === "ROUTE" && (
              <motion.div
                key="route"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Route timeline */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Route Timeline</h4>
                  <div className="relative pl-7 space-y-4">
                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 border-l-2 border-dashed border-slate-200" />

                    <div className="relative">
                      <span className="absolute -left-6 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-emerald-100">
                        <span className="h-1 w-1 rounded-full bg-white" />
                      </span>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pickup Location</span>
                        <p className="text-xs font-bold text-slate-950 mt-0.5">{ride.origin}</p>
                      </div>
                    </div>

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
                    <div className="mt-4 flex gap-2 rounded-xl bg-indigo-50/60 p-3 border border-indigo-100/40 text-[11px] text-indigo-900">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold uppercase tracking-wider block text-[9px] text-indigo-700">Pickup Notes</span>
                        <p className="mt-0.5 text-indigo-700 font-semibold leading-normal">{ride.pickupNote}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-slate-800">Route Map Preview</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-xs">OSRM Live</span>
                  </div>
                  <DarkMap pickup={pickup} drop={drop} height={240} />
                </div>
              </motion.div>
            )}

            {/* DRIVER TAB */}
            {activeTab === "DRIVER" && (
              <motion.div
                key="driver"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Clock, label: "Departure", value: new Date(ride.departureTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
                    { icon: Users, label: "Seats Available", value: `${ride.seatsAvailable} of ${ride.seatsTotal}` },
                    { icon: BadgeIndianRupee, label: "Price / Seat", value: `₹${ride.pricePerSeat}` },
                    { icon: Car, label: "Vehicle", value: ride.vehicleType ?? "Not specified" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                      <div className="p-1.5 rounded-lg bg-indigo-50 inline-block text-indigo-600 mb-1.5">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
                      <div className="text-xs font-bold text-slate-950 mt-0.5 truncate">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Contact & Vehicle details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact & Vehicle</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Driver Contact</span>
                      <p className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        {ride.driverPhone ?? "Shared after booking"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Vehicle Plate</span>
                      <p className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                        <Car className="h-3.5 w-3.5 text-indigo-600" />
                        {ride.vehicleNumber ?? "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-3 flex gap-2.5 text-[11px] text-amber-900">
                    <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wider block text-[9px] text-amber-800 mb-1">Ride Preferences</span>
                      <p className="text-amber-700 font-semibold leading-relaxed">
                        Female preference: <span className="font-extrabold text-slate-950">{ride.femalePreferred ? "Yes" : "No"}</span>
                        {"  ·  "}
                        Verified only: <span className="font-extrabold text-slate-950">{ride.verifiedOnly ? "Yes" : "All students"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "REVIEWS" && (
              <motion.div
                key="reviews"
                id="review-section"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Student Reviews</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">{reviews.length} reviews from campus riders</p>
                    </div>
                    {avgRating && (
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={Math.round(parseFloat(avgRating))} />
                        <span className="text-base font-black text-slate-950">{avgRating}</span>
                      </div>
                    )}
                  </div>

                  {reviews.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 py-8 text-center border border-dashed border-slate-200">
                      <Star className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                      <div className="text-[11px] font-semibold text-slate-500">No reviews yet — be the first!</div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {reviewsToShow.map((r) => (
                        <div key={r.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                                {r.reviewerEmail.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-[10px] font-bold text-slate-900">{r.reviewerEmail.split("@")[0]}</span>
                            </div>
                            <StarRating rating={r.rating} />
                          </div>
                          {r.comment && <p className="mt-1.5 text-xs text-slate-700 leading-relaxed font-medium">{r.comment}</p>}
                          <div className="mt-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {reviews.length > 2 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-center gap-1"
                    >
                      {showAllReviews ? "Show less" : `View all ${reviews.length} reviews`}
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAllReviews && "rotate-180")} />
                    </button>
                  )}

                  {auth.token && (hasCompletedBooking || isOwner) && !alreadyReviewed && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="w-full mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2.5 text-xs shadow-xs hover:shadow-sm transition"
                    >
                      Leave a Review
                    </button>
                  )}

                  {alreadyReviewed && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-emerald-800 flex items-center gap-2 mt-4 text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      You've already reviewed this ride. Thank you!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Sticky Booking Card (Desktop) */}
        <div className="hidden lg:block lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md space-y-4">

            {/* Fare header */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-950">₹{ride.pricePerSeat}</span>
                <span className="text-xs text-slate-500 font-semibold"> / seat</span>
              </div>
              {!isCancelled && !isCompleted && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  isFull
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                )}>
                  {isFull ? "Fully Booked" : `${ride.seatsAvailable} seats left`}
                </span>
              )}
            </div>

            {/* Seat selector — only when bookable */}
            {canBook && (
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Seats</label>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2">
                  <span className="text-xs font-bold text-slate-700">Number of seats</span>
                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
                    <button onClick={() => setSeats((s) => Math.max(1, s - 1))} className="h-7 w-7 rounded-md text-slate-600 hover:bg-slate-100 transition font-bold text-sm">−</button>
                    <span className="w-7 text-center text-sm font-bold text-slate-950">{seats}</span>
                    <button onClick={() => setSeats((s) => Math.min(ride.seatsAvailable, s + 1))} className="h-7 w-7 rounded-md text-slate-600 hover:bg-slate-100 transition font-bold text-sm">+</button>
                  </div>
                </div>
              </div>
            )}

            {/* Cost breakdown — compact */}
            {canBook && (
              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>₹{ride.pricePerSeat} × {seats} seat{seats > 1 ? "s" : ""}</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee (5%)</span>
                  <span className="font-bold text-slate-900">₹{fee}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-extrabold text-slate-950">
                  <span>Total</span>
                  <span className="text-indigo-600 text-base">₹{total}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <BookingCTA />

            {/* Trust badges */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Campus Verified Route</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Free cancellation before driver confirms</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Secure student-only platform</span>
              </div>
            </div>
          </div>

          {/* Owner action buttons below booking card */}
          {isOwner && (isActive || isFull) && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowEditSheet(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Ride
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
          {isOwner && (isCancelled || isCompleted) && (
            <button
              onClick={() => setShowRepostModal(true)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 py-2.5 text-xs font-bold text-violet-700 hover:bg-violet-100 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Repost This Ride
            </button>
          )}
        </div>

      </div>{/* end grid */}

      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      <div className={cn(
        "lg:hidden fixed left-0 right-0 z-35 border-t border-slate-200 bg-white/95 backdrop-blur-lg shadow-2xl px-4 py-3 transition-all duration-300",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        auth.token ? "bottom-11" : "bottom-0"
      )}>
        <div className="flex items-center justify-between gap-3">
          {/* Left: price */}
          <div className="shrink-0">
            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">
              {canBook ? `Total (${seats} seat${seats > 1 ? "s" : ""})` : "Fare"}
            </span>
            <span className="text-base font-black text-indigo-600">₹{canBook ? total : ride.pricePerSeat}</span>
            {!canBook && <span className="text-[9px] text-slate-400 font-semibold"> /seat</span>}
          </div>

          {/* Compact seat selector (only when bookable) */}
          {canBook && (
            <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button onClick={() => setSeats((s) => Math.max(1, s - 1))} className="h-8 w-8 rounded-lg text-slate-600 hover:bg-white transition font-bold">−</button>
              <span className="w-6 text-center text-xs font-extrabold text-slate-950">{seats}</span>
              <button onClick={() => setSeats((s) => Math.min(ride.seatsAvailable, s + 1))} className="h-8 w-8 rounded-lg text-slate-600 hover:bg-white transition font-bold">+</button>
            </div>
          )}

          {/* CTA button — compact */}
          <div className="shrink-0">
            <BookingCTA compact />
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmModal
            open={showDeleteModal}
            title="Delete this ride?"
            description="Are you sure you want to permanently delete this ride? All pending booking requests will be cancelled and this action cannot be undone."
            confirmLabel="Yes, Delete Ride"
            confirmClass="bg-rose-600 hover:bg-rose-700"
            loading={deleting}
            onConfirm={deleteRide}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        {showRepostModal && (
          <ConfirmModal
            open={showRepostModal}
            title="Repost this ride?"
            description="This will create a new active ride using the same route, price, and vehicle details. You can edit it after posting."
            confirmLabel="Yes, Repost Ride"
            confirmClass="bg-violet-600 hover:bg-violet-700"
            loading={reposting}
            onConfirm={repostRide}
            onCancel={() => setShowRepostModal(false)}
          />
        )}

        {showEditSheet && ride && (
          <EditRideSheet
            ride={ride}
            onSave={(updated) => setRide(updated)}
            onClose={() => setShowEditSheet(false)}
          />
        )}

        {showReviewModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-950">Leave Student Feedback</h3>
                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={() => setShowReviewModal(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {isOwner ? (
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
                  <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-200 flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-500">Reviewing:</span>
                    <span className="font-bold text-slate-950">{ride.driverName}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} type="button" onClick={() => setRating(i)}>
                        <Star className={`h-5 w-5 transition ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 hover:text-amber-300"}`} />
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

                <button
                  onClick={async () => { await submitReview(); setShowReviewModal(false); }}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:shadow-sm transition"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
