import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "./Button";
import { TripSummaryCard } from "./TripSummaryCard";

export function BookingSuccess({
  bookingId,
  seatsBooked,
  status = "CONFIRMED",
  trip,
  onClose
}: {
  bookingId: number;
  seatsBooked: number;
  status?: string;
  trip?: {
    origin: string;
    destination: string;
    departureTime: string;
    total: number;
  };
  onClose?: () => void;
}) {
  const isRequested = status === "REQUESTED";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-sm"
    >
      <div className="flex flex-wrap items-start gap-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-emerald-600 shadow-sm"
        >
          <CheckCircle2 className="h-6 w-6" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">{isRequested ? "Booking request sent" : "Booking confirmed"}</h3>
          <p className="mt-1 text-sm leading-6 text-emerald-800">
            {isRequested
              ? `Your request #${bookingId} was sent for ${seatsBooked} seat${seatsBooked > 1 ? "s" : ""}. The driver will approve or reject it from Driver Inbox.`
              : `Your booking #${bookingId} is confirmed for ${seatsBooked} seat${seatsBooked > 1 ? "s" : ""}. Driver contact details are visible in your booking history.`}
          </p>
        </div>
        {onClose ? (
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        ) : null}
      </div>
      {trip ? (
        <TripSummaryCard
          origin={trip.origin}
          destination={trip.destination}
          departureTime={trip.departureTime}
          seats={seatsBooked}
          total={trip.total}
        />
      ) : null}
    </motion.div>
  );
}
