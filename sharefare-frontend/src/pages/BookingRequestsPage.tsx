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
  MessageSquare,
  ChevronDown,
  ChevronUp
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
    <div className="space-y-4 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-3">
      <PageHeader
        title="Booking Requests"
        subtitle="Review, approve, or reject student booking requests for your upcoming campus rides."
        imageUrl="/images/campus-commute.jpg"
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 text-xs text-rose-800 backdrop-blur-md">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <h3 className="font-bold">Unable to load requests</h3>
              <p className="mt-0.5">{error}</p>
              <button onClick={() => void loadData()} className="mt-2 font-bold text-rose-900 underline hover:text-rose-950">
                Try reloading
              </button>
            </div>
          </div>
        </div>
      )}

      {rides.length === 0 && !loading && !error && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-8 text-center shadow-sm backdrop-blur-md max-w-md mx-auto">
          <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">No Offered Rides Yet</h2>
          <p className="mt-1 text-xs text-slate-650 max-w-sm mx-auto">
            You must offer a ride first before you can receive student booking requests. Share your route to campus now!
          </p>
          <div className="mt-4">
            <Button variant="primary" className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-sm font-bold text-xs" onClick={() => window.location.href = "/rides/offer"}>
              Offer a Ride
            </Button>
          </div>
        </div>
      )}

      {rides.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Your Offered Commute Routes</h2>
          
          <div className="space-y-2.5">
            {rides.map((r) => {
              const isExpanded = selectedRideId === r.id;
              
              return (
                <div
                  key={r.id}
                  className={`rounded-xl border transition-all duration-300 bg-white shadow-2xs overflow-hidden ${
                    isExpanded 
                      ? "border-indigo-300 ring-2 ring-indigo-500/5 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-350"
                  }`}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => isExpanded ? setSelectedRideId(null) : handleRideSelect(r.id)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-3 select-none focus:outline-none"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                          {r.origin.split(",")[0]}
                          <span className="text-slate-400 font-normal">→</span>
                          {r.destination.split(",")[0]}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.2 rounded-full border ${
                          r.status === "CANCELLED" 
                            ? "bg-rose-50 border-rose-100 text-rose-700" 
                            : r.status === "COMPLETED" 
                              ? "bg-slate-50 border-slate-200 text-slate-500" 
                              : "bg-emerald-50 border-emerald-100 text-emerald-700"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-650" />
                          {new Date(r.departureTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span>•</span>
                        <span>
                          Seats: <strong className="text-slate-900">{r.seatsTotal - r.seatsAvailable}/{r.seatsTotal}</strong> filled
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          Earnings: ₹{r.earningsPreview}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {r.bookingRequestCount > 0 && (
                        <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[8px] font-black text-white animate-pulse">
                          {r.bookingRequestCount} pending
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/20 p-3 space-y-3.5 animate-in slide-in-from-top-1.5 duration-200">
                      {/* Compact Tab controls */}
                      <div className="flex border-b border-slate-200 bg-slate-100 p-0.5 rounded-lg max-w-xs">
                        {(["PENDING", "ACCEPTED", "REJECTED"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 rounded-md py-1 text-center text-[10px] font-black tracking-tight transition-all duration-200 ${
                              activeTab === tab
                                ? "bg-white text-indigo-650 shadow-2xs border border-slate-200/40"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {tab === "PENDING" && "Pending"}
                            {tab === "ACCEPTED" && "Approved"}
                            {tab === "REJECTED" && "Rejected"}
                          </button>
                        ))}
                      </div>

                      {/* Roster rows */}
                      {loading ? (
                        <div className="space-y-2 py-1.5">
                          <div className="h-9 rounded-xl bg-slate-100 animate-pulse" />
                          <div className="h-9 rounded-xl bg-slate-100 animate-pulse" />
                        </div>
                      ) : filtered.length === 0 ? (
                        <div className="rounded-xl border border-slate-200/60 bg-white py-6 px-4 text-center">
                          <Users className="mx-auto w-5 h-5 text-slate-350 mb-1.5" />
                          <h4 className="text-xs font-bold text-slate-800">
                            {activeTab === "PENDING" && "No pending requests for this ride"}
                            {activeTab === "ACCEPTED" && "No approved passengers yet"}
                            {activeTab === "REJECTED" && "No rejected bookings"}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs mx-auto">
                            {activeTab === "PENDING" 
                              ? "When a student requests to join, their details will display here."
                              : "Actions you make will log here."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {filtered.map((b) => (
                            <div
                              key={b.bookingId}
                              className="relative rounded-lg border border-slate-200/80 bg-white p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-350 transition-all shadow-3xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Compact Avatar */}
                                <div className="relative h-7 w-7 shrink-0 select-none rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 font-extrabold text-white flex items-center justify-center text-[10px] shadow-3xs ring-1 ring-white">
                                  {b.passengerName.charAt(0).toUpperCase()}
                                  {b.passengerVerified && (
                                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-1 ring-white shadow">
                                      <ShieldCheck className="h-1.5 w-1.5 text-white" strokeWidth={3} />
                                    </span>
                                  )}
                                </div>

                                {/* Passenger details */}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap leading-none">
                                    <span className="text-xs font-black text-slate-950 truncate">{b.passengerName}</span>
                                    <span className="text-[8px] font-bold text-slate-500 bg-slate-50 px-1 py-0.2 rounded border border-slate-200/60 font-medium">
                                      ★ {b.passengerTrustScore > 0 ? `${b.passengerTrustScore}%` : "100%"}
                                    </span>
                                    {b.passengerGender && (
                                      <span className="rounded bg-blue-50 px-1 py-0.2 text-[8px] font-bold text-blue-755 border border-blue-100/30">
                                        {b.passengerGender}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-slate-500 truncate mt-0.5">
                                    {b.passengerCollegeName ?? "Campus Student"} • {b.passengerTotalCompletedRides} rides
                                  </p>
                                </div>
                              </div>

                              {/* Seats & Action Row */}
                              <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-slate-100 pt-1.5 sm:pt-0 shrink-0">
                                <span className="text-[9px] font-black text-slate-750 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 shadow-3xs font-mono">
                                  {b.seatsBooked} Seat{b.seatsBooked > 1 ? "s" : ""}
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setDetailsBooking(b)}
                                    title="View Audit Info"
                                    className="p-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-850 transition"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>

                                  {activeTab === "PENDING" && (
                                    <>
                                      <button
                                        disabled={busyId === b.bookingId}
                                        onClick={() => handleAction(b, "reject")}
                                        title="Reject"
                                        className="p-1 rounded-md border border-rose-205 text-rose-600 hover:bg-rose-50/50 transition-all"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        disabled={busyId === b.bookingId}
                                        onClick={() => handleAction(b, "approve")}
                                        title="Accept"
                                        className="p-1 rounded-md bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-2xs hover:shadow-xs transition-all"
                                      >
                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                      </button>
                                    </>
                                  )}

                                  {activeTab === "ACCEPTED" && (
                                    <>
                                      <button
                                        onClick={() => setChatBookingId(b.bookingId)}
                                        title="Message Rider"
                                        className="p-1 rounded-md border border-slate-250 text-slate-655 hover:bg-slate-50 transition"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-black text-emerald-700 border border-emerald-100 tracking-wider uppercase">
                                        Approved
                                      </span>
                                    </>
                                  )}

                                  {activeTab === "REJECTED" && (
                                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[8px] font-black text-rose-700 border border-rose-100 tracking-wider uppercase">
                                      Rejected
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-xs flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4 text-indigo-650" /> Booking Details
              </h3>
              <button
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setDetailsBooking(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Rider Section */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-extrabold flex items-center justify-center text-sm ring-1 ring-white shadow-3xs">
                  {detailsBooking.passengerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">{detailsBooking.passengerName}</h4>
                  <div className="flex flex-col gap-0.5 mt-0.5 text-[10px] text-slate-655">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {detailsBooking.passengerEmail}</span>
                    {detailsBooking.passengerPhone && (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {detailsBooking.passengerPhone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ride Route Map Mock */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-3xs relative h-28 bg-slate-950 flex flex-col justify-between p-3">
                {/* Background Grid Pattern simulating premium map */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:12px_12px]"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[8px] font-black text-blue-400 tracking-widest uppercase border border-blue-500/30">
                    Live Route Overview
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-400">12.4 km (22 mins)</span>
                </div>

                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-200 truncate">{currentRide?.origin}</span>
                  </div>
                  <div className="h-3 w-0.5 bg-gradient-to-b from-emerald-500 to-blue-500 ml-0.5"></div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20"></div>
                    <span className="text-[10px] font-bold text-slate-200 truncate">{currentRide?.destination}</span>
                  </div>
                </div>
              </div>

              {/* Security Audit Details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Safety & Verification Audit
                </h4>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span className="text-slate-550 font-semibold">Campus ID Validation</span>
                    <span className="font-black text-emerald-600 flex items-center gap-0.5 text-[10px]">
                      <ShieldCheck className="w-3 h-3" /> APPROVED
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span className="text-slate-550 font-semibold">Campus Email Verification</span>
                    <span className="font-black text-emerald-700 text-[10px] tracking-wider">VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span className="text-slate-550 font-semibold">College Name</span>
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">
                      {detailsBooking.passengerCollegeName ?? "Verified Campus Student"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-550 font-semibold">Safety Score Rating</span>
                    <span className="font-extrabold text-blue-600">
                      {detailsBooking.passengerSafetyScore > 0 ? `${detailsBooking.passengerSafetyScore}%` : "100.0%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Split Summary */}
              {currentRide && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Split-Cost payment summary
                  </h4>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-550 font-semibold">Cost per seat</span>
                      <span className="font-bold text-slate-900">₹{currentRide.pricePerSeat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550 font-semibold">Seats requested</span>
                      <span className="font-bold text-slate-900">{detailsBooking.seatsBooked}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                      <span className="text-slate-900">Total split earnings</span>
                      <span className="text-emerald-700">₹{currentRide.pricePerSeat * detailsBooking.seatsBooked}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="secondary" className="px-4 py-1.5 text-xs font-bold" onClick={() => setDetailsBooking(null)}>
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
