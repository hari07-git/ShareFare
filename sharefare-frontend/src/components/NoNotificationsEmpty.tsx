import { BellOff } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon={BellOff}
      title="No notifications"
      description="Booking confirmations, ride changes, driver messages, and reminders will show up here."
    />
  );
}
