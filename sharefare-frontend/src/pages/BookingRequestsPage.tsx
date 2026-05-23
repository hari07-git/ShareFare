import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { toast } from "../components/Toast";
import { ChatModal } from "../components/ChatModal";
import { BookingSkeleton } from "../components/Skeletons";
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Users, 
  Check, 
  X, 
  Info, 
  Phone, 
  Mail, 
  Award, 
  TrendingUp, 
  AlertCircle,
  MessageSquare
} from "lucide-react";

type BookingRequest = {
  bookingId: number;
  rideId: number;
  passengerEmail: string;
  passengerName: string;
  passengerPhone: string | null;
  seatsBooked: number;
  status: string;
  createdAt: string;
  passengerGender: string | null;
  passengerTrustScore: number;
  passengerSafetyScore: number;
  passengerTotalCompletedRides: number;
  passengerCancellationRate: number;
  passengerVerified: boolean;
  passengerCollegeName: string | null;
};

type Ride = {
  id: number;
  origin: string;
  destination: string;
  departureTime: string;
  seatsTotal: number;
  seatsAvailable: number;
  pricePerSeat: number;
  status: string;
  passengerCount: number;
  earningsPreview: number;
  bookingRequestCount: number;
};

export function BookingRequestsPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDING" | "ACCEPTED" | "REJECTED">("PENDING");
  const [detailsBooking, setDetailsBooking] = useState<BookingRequest | null>(null);
  const [chatBookingId, setChatBookingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const ridesRes = await api.get<Ride[]>("/api/me/driver/rides");
      setRides(ridesRes.data);
      if (ridesRes.data.length > 0) {
        // default to first ride if not selected or invalid
        const currentSelected = selectedRideId && ridesRes.data.some(r => r.id === selectedRideId) 
          ? selectedRideId 
          : ridesRes.data[0].id;
        setSelectedRideId(currentSelected);
        await loadBookingsForRide(currentSelected);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load ride bookings");
      setLoading(false);
    }
  }

  async function loadBookingsForRide(rideId: number) {
    try {
      const res = await api.get<BookingRequest[]>(`/api/me/driver/rides/${rideId}/bookings`);
      setBookings(res.data);
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const handleRideSelect = async (rideId: number) => {
    setSelectedRideId(rideId);
    setLoading(true);
    await loadBookingsForRide(rideId);
  };

  const handleAction = async (booking: BookingRequest, action: "approve" | "reject") => {
    setBusyId(booking.bookingId);
    try {
      await api.post(`/api/me/driver/rides/${booking.rideId}/bookings/${booking.bookingId}/${action}`);
      toast(
        `Booking ${action === "approve" ? "approved successfully" : "rejected"}`,
        action === "approve" ? "success" : "info"
      );
      // Reload bookings and rides
      const ridesRes = await api.get<Ride[]>("/api/me/driver/rides");
      setRides(ridesRes.data);
      if (selectedRideId) {
        await loadBookingsForRide(selectedRideId);
      }
    } catch (err: any) {
      toast(err?.response?.data?.message ?? `Failed to ${action} booking`, "error");
    } finally {
      setBusyId(null);
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter((b) => {
      if (activeTab === "PENDING") return b.status === "REQUESTED";
      if (activeTab === "ACCEPTED") return ["DRIVER_APPROVED", "CONFIRMED", "ONGOING", "COMPLETED"].includes(b.status);
      if (activeTab === "REJECTED") return b.status === "REJECTED";
      return false;
    });
  };

  const filtered = getFilteredBookings();
  const currentRide = rides.find((r) => r.id === selectedRideId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <PageHeader
        title="Booking Requests"
        subtitle="Review, approve, or reject student booking requests for your upcoming campus rides."
        imageUrl="/images/campus-commute.jpg"
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-800 backdrop-blur-xl">
          <div className="flex gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <h3 className="font-semibold">Unable to load requests</h3>
              <p className="mt-1">{error}</p>
              <button onClick={() => void loadData()} className="mt-3 font-semibold text-rose-900 underline hover:text-rose-950">
                Try reloading
              </button>
            </div>
          </div>
        </div>
      )}

      {rides.length === 0 && !loading && !error && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/60 p-12 text-center shadow-lg backdrop-blur-xl max-w-2xl mx-auto">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 shadow-inner">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Offered Rides Yet</h2>
          <p className="mt-2 text-slate-600 max-w-md mx-auto">
            You must offer a ride first before you can receive student booking requests. Share your route to campus now!
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => window.location.href = "/rides/offer"}>
              Offer a Ride
            </Button>
          </div>
        </div>
      )}

      {rides.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Panel: Rides List Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-md backdrop-blur-md">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Your Campus Routes</h2>
              <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                {rides.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRideSelect(r.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                      selectedRideId === r.id
                        ? "border-blue-500 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 shadow-md ring-1 ring-blue-500/10"
                        : "border-slate-100 bg-white hover:bg-slate-50/80 hover:border-slate-200 hover:shadow"
                    }`}
                  >
                    <div className="font-bold text-slate-900 truncate">{r.origin.split(",")[0]} → {r.destination.split(",")[0]}</div>
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {new Date(r.departureTime).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-2.5">
                      <span className="text-xs font-semibold text-slate-500">
                        Seats: <span className="text-slate-900">{r.seatsTotal - r.seatsAvailable}/{r.seatsTotal}</span>
                      </span>
                      <span className="rounded-full bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {r.bookingRequestCount} pending
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Bookings Dashboard */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Info */}
            {currentRide && (
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-md flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Route: {currentRide.origin.split(",")[0]} → {currentRide.destination.split(",")[0]}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Departing on {new Date(currentRide.departureTime).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Earnings</div>
                    <div className="text-sm font-bold text-emerald-700">₹{currentRide.earningsPreview}</div>
                  </div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status</div>
                    <div className="text-sm font-bold text-blue-700">{currentRide.status}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Controls */}
            <div className="flex border-b border-slate-200 bg-slate-50/60 p-1 rounded-xl">
              {(["PENDING", "ACCEPTED", "REJECTED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-lg py-2.5 text-center text-sm font-bold tracking-tight transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "PENDING" && "Pending Requests"}
                  {tab === "ACCEPTED" && "Approved"}
                  {tab === "REJECTED" && "Rejected"}
                </button>
              ))}
            </div>

            {/* Requests List */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <BookingSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-12 text-center shadow-md backdrop-blur-xl">
                <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeTab === "PENDING" && "No pending requests yet"}
                  {activeTab === "ACCEPTED" && "No approved passengers"}
                  {activeTab === "REJECTED" && "No rejected bookings"}
                </h3>
                <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">
                  {activeTab === "PENDING"
                    ? "Any student ride booking request for this campus commute will show up here."
                    : "Requests you take action on will appear in this log."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((b) => (
                  <div
                    key={b.bookingId}
                    className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-100"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Rider Header Card */}
                      <div className="flex items-center gap-3.5">
                        <div className="relative h-12 w-12 shrink-0 select-none rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 font-bold text-white flex items-center justify-center text-base shadow-md ring-2 ring-white">
                          {b.passengerName.charAt(0).toUpperCase()}
                          {b.passengerVerified && (
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                              <ShieldCheck className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-950 flex flex-wrap items-center gap-2">
                            {b.passengerName}
                            {b.passengerGender && (
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100/50">
                                {b.passengerGender}
                              </span>
                            )}
                            {b.passengerVerified && (
                              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100/50">
                                Verified Student
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 font-medium mt-1">
                            {b.passengerCollegeName ?? "BITS Pilani Hyderabad"}
                          </div>
                        </div>
                      </div>

                      {/* Seat Count & Time */}
                      <div className="text-right">
                        <div className="rounded-lg bg-slate-50 px-2.5 py-1 inline-block text-xs font-bold text-slate-900 border border-slate-100">
                          {b.seatsBooked} {b.seatsBooked === 1 ? "seat" : "seats"} requested
                        </div>
                        <div className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Community Ratings Badge */}
                    <div className="mt-4 grid grid-cols-3 gap-2.5 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Trust Score</span>
                        <span className="text-sm font-bold text-slate-900">
                          {b.passengerTrustScore > 0 ? `${b.passengerTrustScore}%` : "100%"}
                        </span>
                      </div>
                      <div className="text-center border-x border-slate-200/80">
                        <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Completed Rides</span>
                        <span className="text-sm font-bold text-slate-900">{b.passengerTotalCompletedRides}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Cancellation Rate</span>
                        <span className="text-sm font-bold text-rose-600">
                          {b.passengerCancellationRate > 0 ? `${b.passengerCancellationRate}%` : "0%"}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => setDetailsBooking(b)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <Info className="w-4 h-4" /> View full profile & routing
                      </button>

                      {activeTab === "PENDING" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            disabled={busyId === b.bookingId}
                            onClick={() => handleAction(b, "reject")}
                            className="flex items-center gap-1 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                          >
                            <X className="w-4 h-4" /> Reject
                          </Button>
                          <Button
                            variant="primary"
                            disabled={busyId === b.bookingId}
                            onClick={() => handleAction(b, "approve")}
                            className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 border-none hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/10"
                          >
                            <Check className="w-4 h-4" /> Accept
                          </Button>
                        </div>
                      )}

                      {activeTab === "ACCEPTED" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => setChatBookingId(b.bookingId)}
                            className="flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-4 h-4" /> Message rider
                          </Button>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                            Approved
                          </span>
                        </div>
                      )}

                      {activeTab === "REJECTED" && (
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" /> Booking Details
              </h3>
              <button
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setDetailsBooking(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {/* Rider Section */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-extrabold flex items-center justify-center text-lg">
                  {detailsBooking.passengerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{detailsBooking.passengerName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-600 flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {detailsBooking.passengerEmail}</span>
                    {detailsBooking.passengerPhone && (
                      <span className="text-xs text-slate-600 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {detailsBooking.passengerPhone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ride Route Map Mock */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative h-40 bg-slate-950/95 flex flex-col justify-between p-3.5">
                {/* Background Grid Pattern simulating premium map */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[9px] font-black text-blue-400 tracking-wider uppercase border border-blue-500/30">
                    Live Route Overview
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">12.4 km (22 mins)</span>
                </div>

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-slate-200 truncate">{currentRide?.origin}</span>
                  </div>
                  <div className="h-6 w-0.5 bg-gradient-to-b from-emerald-500 to-blue-500 ml-0.75"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20"></div>
                    <span className="text-xs font-bold text-slate-200 truncate">{currentRide?.destination}</span>
                  </div>
                </div>
              </div>

              {/* Security Audit Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Safety & Verification Audit
                </h4>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-2">
                    <span className="text-slate-600 font-medium">Campus ID Validation</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> APPROVED
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-2">
                    <span className="text-slate-600 font-medium">BITS Mail Verification</span>
                    <span className="font-bold text-emerald-600">VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100/50 pb-2">
                    <span className="text-slate-600 font-medium">College Name</span>
                    <span className="font-bold text-slate-900 truncate max-w-[240px]">
                      {detailsBooking.passengerCollegeName ?? "BITS Pilani Hyderabad"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Safety Score Rating</span>
                    <span className="font-extrabold text-blue-600">
                      {detailsBooking.passengerSafetyScore > 0 ? `${detailsBooking.passengerSafetyScore}%` : "100.0%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Split Summary */}
              {currentRide && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> Split-Cost payment summary
                  </h4>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Cost per seat</span>
                      <span className="font-bold text-slate-900">₹{currentRide.pricePerSeat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Seats requested</span>
                      <span className="font-bold text-slate-900">{detailsBooking.seatsBooked}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/80 pt-2 font-bold">
                      <span className="text-slate-900">Total split earnings</span>
                      <span className="text-emerald-700">₹{currentRide.pricePerSeat * detailsBooking.seatsBooked}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setDetailsBooking(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {chatBookingId && (
        <ChatModal bookingId={chatBookingId} onClose={() => setChatBookingId(null)} />
      )}
    </div>
  );
}
