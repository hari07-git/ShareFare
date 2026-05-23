import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { toast } from "../components/Toast";
import { BookingSkeleton } from "../components/Skeletons";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Car, 
  XCircle,
  AlertCircle,
  BarChart3
} from "lucide-react";

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

type Booking = {
  bookingId: number;
  rideId: number;
  passengerEmail: string;
  passengerName: string;
  passengerPhone: string | null;
  seatsBooked: number;
  status: string;
  createdAt: string;
};

export function MyOfferedRidesPage() {
  const { me } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [expandedRideId, setExpandedRideId] = useState<number | null>(null);
  const [rideBookings, setRideBookings] = useState<Record<number, Booking[]>>({});
  const [loadingBookings, setLoadingBookings] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function loadRides() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Ride[]>("/api/me/driver/rides");
      setRides(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to fetch offered rides");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRides();
  }, []);

  const loadBookingsForRide = async (rideId: number) => {
    setLoadingBookings(prev => ({ ...prev, [rideId]: true }));
    try {
      const res = await api.get<Booking[]>(`/api/me/driver/rides/${rideId}/bookings`);
      setRideBookings(prev => ({ ...prev, [rideId]: res.data }));
    } catch (err: any) {
      toast("Failed to load passenger list", "error");
    } finally {
      setLoadingBookings(prev => ({ ...prev, [rideId]: false }));
    }
  };

  const handleExpandRide = async (rideId: number) => {
    if (expandedRideId === rideId) {
      setExpandedRideId(null);
    } else {
      setExpandedRideId(rideId);
      if (!rideBookings[rideId]) {
        await loadBookingsForRide(rideId);
      }
    }
  };

  const handleCancelRide = async (rideId: number) => {
    if (!window.confirm("Are you sure you want to cancel this ride? Active passenger bookings will be cancelled and notified.")) return;
    setBusyId(rideId);
    try {
      await api.post(`/api/me/driver/rides/${rideId}/cancel`);
      toast("Ride cancelled successfully", "info");
      await loadRides();
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Failed to cancel ride", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkCompleted = async (rideId: number) => {
    const bookingsForThisRide = rideBookings[rideId] ?? [];
    const activeBookings = bookingsForThisRide.filter(b => ["DRIVER_APPROVED", "CONFIRMED", "ONGOING"].includes(b.status));
    
    if (activeBookings.length === 0) {
      if (!window.confirm("Mark this empty ride completed?")) return;
    }
    
    setBusyId(rideId);
    try {
      // Mark each active passenger booking completed
      for (const b of activeBookings) {
        await api.post(`/api/me/driver/rides/${rideId}/bookings/${b.bookingId}/complete`);
      }
      // Set ride status itself to COMPLETED
      toast("Ride marked completed successfully!", "success");
      await loadRides();
      if (expandedRideId === rideId) {
        await loadBookingsForRide(rideId);
      }
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Failed to complete ride bookings", "error");
    } finally {
      setBusyId(null);
    }
  };

  const calculateAnalytics = () => {
    let totalEarnings = 0;
    let completedTrips = 0;
    let totalPassengers = 0;

    rides.forEach((r) => {
      if (r.status === "COMPLETED") {
        completedTrips += 1;
      }
      totalPassengers += r.passengerCount;
      totalEarnings += r.earningsPreview;
    });

    return { totalEarnings, completedTrips, totalPassengers };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <PageHeader
        title="My Offered Rides"
        subtitle="Manage your offered routes, track total passenger bookings, and review travel earnings."
        imageUrl="/images/gachibowli-road.jpg"
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-800 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Analytics Dashboard Grid */}
      {rides.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Earnings</span>
                <span className="block mt-1 text-xl font-black text-emerald-700">₹{analytics.totalEarnings}</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Passengers</span>
                <span className="block mt-1 text-xl font-black text-slate-900">{analytics.totalPassengers}</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rides Completed</span>
                <span className="block mt-1 text-xl font-black text-indigo-700">{analytics.completedTrips}</span>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verification Level</span>
                <span className="block mt-1 text-xl font-black text-slate-900">Level {me?.verificationLevel ?? 0}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
                <Car className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rides List Section */}
      <Card
        title="Offered Drives"
        subtitle="Manage statuses, calculate bookings percentage, and mark completions"
        action={
          <Button
            variant="primary"
            onClick={() => navigate("/rides/offer")}
            className="flex items-center gap-1 text-xs py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-md shadow-blue-500/10"
          >
            <Plus className="w-3.5 h-3.5" /> Offer a Ride
          </Button>
        }
      >
        {loading ? (
          <div className="space-y-4 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <BookingSkeleton key={i} />
            ))}
          </div>
        ) : rides.length === 0 ? (
          <div className="rounded-2xl bg-slate-50/50 p-12 text-center border border-dashed border-slate-200 max-w-xl mx-auto my-6">
            <div className="mx-auto w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center text-slate-400 mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Offered Drives Yet</h3>
            <p className="mt-1 text-sm text-slate-600 max-w-xs mx-auto">
              Share your commute route with campus riders! Save split-costs and find student travel buddies.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {rides.map((r) => {
              const bookedSeatsPercent = Math.min(
                100,
                Math.round(((r.seatsTotal - r.seatsAvailable) / r.seatsTotal) * 100)
              );
              const isCompleted = r.status === "COMPLETED";
              const isCancelled = r.status === "CANCELLED";
              const isExpanded = expandedRideId === r.id;

              return (
                <div
                  key={r.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow hover:border-slate-300"
                >
                  <div className="flex flex-col md:flex-row gap-5 justify-between">
                    {/* Ride Header Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          {new Date(r.departureTime).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${
                            isCompleted
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : isCancelled
                              ? "bg-rose-100 text-rose-800 border-rose-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      {/* Origin Destination Text */}
                      <div className="font-extrabold text-slate-900 text-base">
                        {r.origin.split(",")[0]} → {r.destination.split(",")[0]}
                      </div>

                      {/* Occupancy Indicator Bar */}
                      {!isCancelled && !isCompleted && (
                        <div className="space-y-1 max-w-sm">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <span>Occupancy seats</span>
                            <span>{r.seatsTotal - r.seatsAvailable}/{r.seatsTotal} Booked</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${bookedSeatsPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cost Split & Analytics */}
                    <div className="w-full md:w-72 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 gap-4">
                      <div className="flex justify-between items-center bg-slate-50/80 p-3 rounded-2xl border border-slate-100/50">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">Cost split per seat</span>
                          <span className="block text-sm font-extrabold text-slate-900 mt-1">₹{r.pricePerSeat}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">Earnings preview</span>
                          <span className="block text-sm font-black text-emerald-700 mt-1">₹{r.earningsPreview}</span>
                        </div>
                      </div>

                      {/* Action Bar Triggers */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Expand passenger list */}
                        <Button
                          variant="secondary"
                          onClick={() => handleExpandRide(r.id)}
                          className="flex-1 text-xs py-1.5"
                        >
                          {isExpanded ? "Hide List" : `Passengers (${r.passengerCount})`}
                        </Button>

                        {!isCancelled && !isCompleted && (
                          <>
                            <Button
                              variant="primary"
                              disabled={busyId === r.id}
                              onClick={() => void handleMarkCompleted(r.id)}
                              className="flex-1 text-xs py-1.5 bg-emerald-600 border-none hover:bg-emerald-700 shadow-sm shadow-emerald-500/10"
                            >
                              Complete
                            </Button>
                            <Button
                              variant="danger"
                              disabled={busyId === r.id}
                              onClick={() => void handleCancelRide(r.id)}
                              className="flex-none p-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Passenger Roster Grid */}
                  {isExpanded && (
                    <div className="mt-5 border-t border-slate-100 pt-4 space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Booked Passenger Roster</h4>
                      {loadingBookings[r.id] ? (
                        <div className="text-xs text-slate-600">Loading roster...</div>
                      ) : !rideBookings[r.id] || rideBookings[r.id].length === 0 ? (
                        <div className="text-xs text-slate-600">No seat bookings roster found for this drive.</div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {rideBookings[r.id].map((b) => (
                            <div
                              key={b.bookingId}
                              className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black flex items-center justify-center text-xs">
                                  {b.passengerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="block text-xs font-bold text-slate-900 leading-none">{b.passengerName}</span>
                                  <span className="block text-[10px] text-slate-600 mt-1">{b.passengerPhone ?? "No contact phone"}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-xs font-bold text-slate-800">{b.seatsBooked} {b.seatsBooked === 1 ? 'seat' : 'seats'}</span>
                                <span className="block text-[9px] font-semibold text-slate-500 uppercase mt-0.5">{b.status.replace("_", " ")}</span>
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
        )}
      </Card>
    </div>
  );
}
