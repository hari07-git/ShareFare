import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { toast } from "../components/Toast";
import { BookingSkeleton } from "../components/Skeletons";
import { ChatModal } from "../components/ChatModal";
import { 
  MessageSquare, 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck, 
  Car, 
  AlertCircle, 
  X, 
  Star,
  CheckCircle2,
  Lock
} from "lucide-react";

type BookedRide = {
  bookingId: number;
  rideId: number;
  origin: string;
  destination: string;
  departureTime: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string | null;
  seatsBooked: number;
  status: string;
  vehicleType: string | null;
  vehicleNumber: string | null;
  driverGender: string | null;
  driverTrustScore: number;
  driverSafetyScore: number;
  driverVerified: boolean;
  rideOtp: string;
  pricePerSeat: number;
};

export function BookedRidesPage() {
  const [bookings, setBookings] = useState<BookedRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST" | "CANCELLED">("UPCOMING");
  const [chatBookingId, setChatBookingId] = useState<number | null>(null);
  const [reviewBooking, setReviewBooking] = useState<BookedRide | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function loadBookings() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<BookedRide[]>("/api/me/bookings");
      setBookings(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load your booked rides.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setBusyId(bookingId);
    try {
      await api.delete(`/api/bookings/${bookingId}`);
      toast("Booking cancelled successfully", "info");
      await loadBookings();
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Failed to cancel booking", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setSubmittingReview(true);
    try {
      await api.post("/api/reviews", {
        rideId: reviewBooking.rideId,
        rating,
        comment
      });
      toast("Review submitted successfully! Thank you.", "success");
      setReviewBooking(null);
      setComment("");
      setRating(5);
      await loadBookings();
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter((b) => {
      const isCancelledOrRejected = ["CANCELLED", "REJECTED"].includes(b.status);
      const isCompleted = b.status === "COMPLETED";
      
      if (activeTab === "CANCELLED") return isCancelledOrRejected;
      if (activeTab === "PAST") return isCompleted;
      // UPCOMING includes REQUESTED, DRIVER_APPROVED, CONFIRMED, ONGOING
      return !isCancelledOrRejected && !isCompleted;
    });
  };

  const getStatusLabelAndColor = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return { label: "Requested (Pending)", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "DRIVER_APPROVED":
        return { label: "Driver Approved", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "CONFIRMED":
        return { label: "Trip Confirmed", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "ONGOING":
        return { label: "Ride is Ongoing", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "COMPLETED":
        return { label: "Trip Completed", color: "bg-slate-100 text-slate-800 border-slate-200" };
      case "CANCELLED":
        return { label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-200" };
      case "REJECTED":
        return { label: "Rejected by Driver", color: "bg-rose-100 text-rose-800 border-rose-200" };
      default:
        return { label: status, color: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  const filtered = getFilteredBookings();

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <PageHeader
        title="My Booked Trips"
        subtitle="Track your travel itineraries, view pickup codes, message drivers, and complete reviews."
        imageUrl="/images/campus-commute.jpg"
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/60 p-1 rounded-xl">
        {(["UPCOMING", "PAST", "CANCELLED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2.5 text-center text-sm font-bold tracking-tight transition-all duration-300 ${
              activeTab === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "UPCOMING" && "Upcoming Commutes"}
            {tab === "PAST" && "Past Travels"}
            {tab === "CANCELLED" && "Cancelled Trips"}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-800">
          <p>{error}</p>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <BookingSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white/60 p-12 text-center shadow-lg backdrop-blur-xl max-w-xl mx-auto">
          <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {activeTab === "UPCOMING" && "No Booked Rides Yet"}
            {activeTab === "PAST" && "No Completed Trips"}
            {activeTab === "CANCELLED" && "No Cancelled Trips"}
          </h3>
          <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">
            {activeTab === "UPCOMING"
              ? "Plan your campus travel! Find a student ride and share your commute journey today."
              : "Your travel history logs will show up here after trip completions."}
          </p>
          {activeTab === "UPCOMING" && (
            <div className="mt-5">
              <Button variant="primary" onClick={() => navigate("/rides/find")}>
                Find a Ride
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((b) => {
            const { label, color } = getStatusLabelAndColor(b.status);
            return (
              <div
                key={b.bookingId}
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:border-blue-100 flex flex-col md:flex-row gap-6 justify-between"
              >
                {/* Timeline Map Overview */}
                <div className="flex-1 space-y-4">
                  {/* Timeline Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      {new Date(b.departureTime).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${color}`}>
                      {label}
                    </span>
                  </div>

                  {/* Route Timeline Connectors */}
                  <div className="relative pl-6 space-y-5 border-l-2 border-indigo-100 ml-3 py-1">
                    {/* Origin Marker */}
                    <div className="relative">
                      <div className="absolute -left-9 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Pickup Area</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{b.origin}</p>
                    </div>

                    {/* Destination Marker */}
                    <div className="relative">
                      <div className="absolute -left-9 top-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Drop Destination</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{b.destination}</p>
                    </div>
                  </div>

                  {/* Booking Metadata details */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
                    <span>Seats Reserved: <span className="text-slate-900">{b.seatsBooked}</span></span>
                    <span>Cost: <span className="text-slate-900">₹{b.seatsBooked * b.pricePerSeat}</span></span>
                    <span>Ride ID: <span className="text-slate-900">#{b.rideId}</span></span>
                  </div>
                </div>

                {/* Right Side: Driver Profiles & OTP Security */}
                <div className="w-full md:w-80 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 gap-5">
                  {/* Driver Card */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 select-none rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 font-extrabold text-white flex items-center justify-center text-sm ring-2 ring-white">
                        {b.driverName.charAt(0).toUpperCase()}
                        {b.driverVerified && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-1 ring-white">
                            <ShieldCheck className="h-2 w-2 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {b.driverName}
                          {b.driverVerified && (
                            <span className="rounded bg-emerald-50 px-1 py-0.2 text-[8px] font-bold text-emerald-700 uppercase border border-emerald-100/50">
                              Verified
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-600 font-medium">{b.driverGender ?? "Driver"} • BITS Commuter</p>
                      </div>
                    </div>

                    {/* Driver Trust Metric */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{b.driverTrustScore > 0 ? `${b.driverTrustScore}% Trust Score` : "100% Trust Score"}</span>
                    </div>

                    {/* Vehicle Plate Details */}
                    {b.vehicleType && (
                      <div className="mt-3 flex items-center gap-2 border-t border-slate-200/50 pt-2.5 text-xs text-slate-700">
                        <Car className="w-4 h-4 text-blue-500" />
                        <span className="font-bold">{b.vehicleType}</span>
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-black text-slate-700">
                          {b.vehicleNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* OTP Block Banner */}
                  {["DRIVER_APPROVED", "CONFIRMED", "ONGOING"].includes(b.status) && (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-indigo-500 uppercase tracking-wider leading-none">Security OTP</span>
                          <span className="block text-xs font-medium text-slate-600 mt-1">Provide at pickup</span>
                        </div>
                      </div>
                      <span className="text-base font-black tracking-wider text-indigo-700 font-mono bg-white px-3 py-1.5 rounded-xl border border-indigo-100">
                        {b.rideOtp}
                      </span>
                    </div>
                  )}

                  {/* Dynamic Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-auto">
                    {/* Message Driver Trigger */}
                    {b.status !== "CANCELLED" && b.status !== "REJECTED" && (
                      <Button
                        variant="secondary"
                        onClick={() => setChatBookingId(b.bookingId)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </Button>
                    )}

                    {/* Cancellation / Review Triggers */}
                    {b.status === "COMPLETED" ? (
                      <Button
                        variant="primary"
                        onClick={() => setReviewBooking(b)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 bg-emerald-600 border-none hover:bg-emerald-700 shadow-md shadow-emerald-500/10"
                      >
                        <Star className="w-4 h-4" /> Rate Driver
                      </Button>
                    ) : (
                      !["CANCELLED", "REJECTED", "COMPLETED"].includes(b.status) && (
                        <Button
                          variant="danger"
                          disabled={busyId === b.bookingId}
                          onClick={() => void handleCancelBooking(b.bookingId)}
                          className="flex-1 text-xs py-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                        >
                          {busyId === b.bookingId ? "Cancelling..." : "Cancel"}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Driver Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Review Your Travel
              </h3>
              <button
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setReviewBooking(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Rate Driver: {reviewBooking.driverName}
                </label>
                <div className="flex items-center gap-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform duration-200 active:scale-95"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "text-amber-500 fill-amber-500 hover:text-amber-600"
                            : "text-slate-300 hover:text-slate-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Share your commuting experience
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Mention pickup convenience, route safety, vehicle comfort, or driving conduct..."
                  className="w-full min-h-[100px] rounded-2xl border border-slate-200 p-4 text-sm text-slate-950 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="secondary" type="button" onClick={() => setReviewBooking(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submittingReview}
                  className="bg-indigo-600 hover:bg-indigo-700 border-none shadow-md shadow-indigo-500/10"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {chatBookingId && (
        <ChatModal bookingId={chatBookingId} onClose={() => setChatBookingId(null)} />
      )}
    </div>
  );
}
