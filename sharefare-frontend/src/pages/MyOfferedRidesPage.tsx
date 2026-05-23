import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/auth";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { toast } from "../components/Toast";
import { BookingSkeleton } from "../components/Skeletons";
import { Input } from "../components/Input";
import { FormField } from "../components/FormField";
import { GradientButton } from "../components/GradientButton";
import { motion, AnimatePresence } from "framer-motion";
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
  BarChart3,
  Pencil,
  Trash2,
  X,
  Clock,
  BadgeIndianRupee,
  ChevronDown,
  ChevronUp
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
  vehicleType?: string;
  vehicleNumber?: string;
  pickupNote?: string;
  femalePreferred?: boolean;
  verifiedOnly?: boolean;
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

type EditFormState = {
  departureTime: string;
  seatsTotal: number;
  pricePerSeat: number;
  vehicleType: string;
  vehicleNumber: string;
  pickupNote: string;
  femalePreferred: boolean;
  verifiedOnly: boolean;
};

function toLocalDatetimeString(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toBackendDepartureTime(value: string) {
  if (!value.trim()) return undefined;
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) return value;
  return `${value.length === 16 ? `${value}:00` : value}+05:30`;
}

export function MyOfferedRidesPage() {
  const { me } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [expandedRideId, setExpandedRideId] = useState<number | null>(null);
  const [rideBookings, setRideBookings] = useState<Record<number, Booking[]>>({});
  const [loadingBookings, setLoadingBookings] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  async function loadRides() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Ride[]>("/api/me/driver/rides");
      setRides(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to fetch rides");
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

  const handleDeleteRide = async (rideId: number) => {
    if (!window.confirm("Are you sure you want to delete this ride? This action cannot be undone.")) return;
    setDeletingId(rideId);
    try {
      await api.delete(`/api/rides/${rideId}`);
      toast("Ride deleted successfully", "success");
      await loadRides();
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Failed to delete ride", "error");
    } finally {
      setDeletingId(null);
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

  const openEditModal = (ride: Ride) => {
    setEditingRide(ride);
    setEditForm({
      departureTime: toLocalDatetimeString(ride.departureTime),
      seatsTotal: ride.seatsTotal,
      pricePerSeat: ride.pricePerSeat,
      vehicleType: ride.vehicleType ?? "",
      vehicleNumber: ride.vehicleNumber ?? "",
      pickupNote: ride.pickupNote ?? "",
      femalePreferred: ride.femalePreferred ?? false,
      verifiedOnly: ride.verifiedOnly ?? false,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingRide || !editForm) return;
    setEditBusy(true);
    try {
      await api.put(`/api/rides/${editingRide.id}`, {
        departureTime: toBackendDepartureTime(editForm.departureTime),
        seatsTotal: editForm.seatsTotal,
        pricePerSeat: editForm.pricePerSeat,
        vehicleType: editForm.vehicleType.trim() || null,
        vehicleNumber: editForm.vehicleNumber.trim() || null,
        pickupNote: editForm.pickupNote.trim() || null,
        femalePreferred: editForm.femalePreferred,
        verifiedOnly: editForm.verifiedOnly,
      });
      toast("Ride updated successfully!", "success");
      setEditingRide(null);
      setEditForm(null);
      await loadRides();
    } catch (err: any) {
      toast(err?.response?.data?.message ?? "Failed to update ride", "error");
    } finally {
      setEditBusy(false);
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
        title="My Drives"
        subtitle="Manage your routes, edit ride details, track bookings, and review your travel earnings."
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
        title="Your Drives"
        subtitle="Edit ride details, manage passengers, and track performance"
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
            <h3 className="text-base font-bold text-slate-900">No Drives Yet</h3>
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
              const isActive = !isCancelled && !isCompleted;

              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
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
                        <div className="flex items-center gap-2">
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
                      </div>

                      {/* Origin Destination Text */}
                      <div className="font-extrabold text-slate-900 text-base">
                        {r.origin.split(",")[0]} → {r.destination.split(",")[0]}
                      </div>

                      {/* Vehicle info */}
                      {(r.vehicleType || r.vehicleNumber) && (
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <Car className="w-3.5 h-3.5 text-slate-400" />
                          {r.vehicleType && <span>{r.vehicleType}</span>}
                          {r.vehicleNumber && <span className="text-slate-400">• {r.vehicleNumber}</span>}
                        </div>
                      )}

                      {/* Occupancy Indicator Bar */}
                      {isActive && (
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
                          className="flex-1 text-xs py-1.5 flex items-center justify-center gap-1"
                        >
                          {isExpanded ? <><ChevronUp className="w-3 h-3" /> Hide</> : <><ChevronDown className="w-3 h-3" /> Passengers ({r.passengerCount})</>}
                        </Button>

                        {isActive && (
                          <>
                            {/* Edit button */}
                            <Button
                              variant="secondary"
                              onClick={() => openEditModal(r)}
                              className="flex-none p-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
                              title="Edit ride details"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            
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
                              title="Cancel ride"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {/* Delete button — always available */}
                        <Button
                          variant="danger"
                          disabled={deletingId === r.id}
                          onClick={() => void handleDeleteRide(r.id)}
                          className="flex-none p-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          title="Delete ride permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Passenger Roster Grid */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-5 border-t border-slate-100 pt-4 space-y-3.5 overflow-hidden"
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════
          EDIT RIDE MODAL
      ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {editingRide && editForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => { setEditingRide(null); setEditForm(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-indigo-500" />
                    Edit Ride
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingRide.origin.split(",")[0]} → {editingRide.destination.split(",")[0]}
                  </p>
                </div>
                <button
                  onClick={() => { setEditingRide(null); setEditForm(null); }}
                  className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-5">
                <FormField label="Departure time">
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                    <Input
                      value={editForm.departureTime}
                      onChange={(e) => setEditForm({ ...editForm, departureTime: e.target.value })}
                      className="pl-10"
                      type="datetime-local"
                    />
                  </div>
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Seats available">
                    <div className="grid grid-cols-6 rounded-xl border border-slate-200 bg-slate-50 p-1">
                      {[1, 2, 3, 4, 5, 6].map((seat) => (
                        <button
                          key={seat}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, seatsTotal: seat })}
                          className={`h-9 rounded-lg text-sm font-semibold transition ${seat === editForm.seatsTotal ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white"}`}
                        >
                          {seat}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Price per seat">
                    <div className="relative">
                      <BadgeIndianRupee className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                      <Input
                        value={editForm.pricePerSeat}
                        onChange={(e) => setEditForm({ ...editForm, pricePerSeat: parseFloat(e.target.value || "0") })}
                        className="pl-10"
                        type="number"
                        min={0}
                        step="0.5"
                      />
                    </div>
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Vehicle type">
                    <Input
                      value={editForm.vehicleType}
                      onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                      placeholder="Maruti Swift, Activa, i20..."
                    />
                  </FormField>
                  <FormField label="Vehicle number">
                    <Input
                      value={editForm.vehicleNumber}
                      onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value })}
                      placeholder="TS09 AB 1234"
                    />
                  </FormField>
                </div>

                <FormField label="Pickup note">
                  <Input
                    value={editForm.pickupNote}
                    onChange={(e) => setEditForm({ ...editForm, pickupNote: e.target.value })}
                    placeholder="Example: near JNTU metro gate 2"
                  />
                </FormField>

                {/* Safety Preferences */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="mb-3 text-xs font-semibold text-slate-600">Safety Preferences</div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:bg-slate-50 transition">
                      <input
                        type="checkbox"
                        checked={editForm.verifiedOnly}
                        onChange={(e) => setEditForm({ ...editForm, verifiedOnly: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Verified Students Only</div>
                        <div className="text-xs text-slate-500">Only fully verified users can book</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50 p-3 cursor-pointer hover:bg-purple-100/50 transition">
                      <input
                        type="checkbox"
                        checked={editForm.femalePreferred}
                        onChange={(e) => setEditForm({ ...editForm, femalePreferred: e.target.checked })}
                        className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-sm font-semibold text-purple-900">Female Passengers Preferred</div>
                        <div className="text-xs text-purple-700">Display prominently to female riders</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center gap-3 rounded-b-3xl">
                <Button
                  variant="secondary"
                  onClick={() => { setEditingRide(null); setEditForm(null); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <GradientButton
                  disabled={editBusy}
                  onClick={handleEditSubmit}
                  className="flex-1"
                >
                  {editBusy ? "Saving..." : "Save Changes"}
                </GradientButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
