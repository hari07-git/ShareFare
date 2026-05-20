import { CarFront } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function NoRidesEmpty({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={CarFront}
      title="No rides found"
      description="Try nearby Hyderabad routes like Gachibowli, HITEC City, JNTU, Kukatpally, or your college name."
      actionLabel={onClear ? "Clear filters" : undefined}
      onAction={onClear}
    />
  );
}
