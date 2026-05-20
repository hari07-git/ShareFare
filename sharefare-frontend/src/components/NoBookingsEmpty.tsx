import { CalendarX } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function NoBookingsEmpty({ onFindRide }: { onFindRide?: () => void }) {
  return (
    <EmptyState
      icon={CalendarX}
      title="No bookings yet"
      description="Book a shared ride and your trip history, driver contact, and status updates will appear here."
      actionLabel={onFindRide ? "Find a ride" : undefined}
      onAction={onFindRide}
    />
  );
}
