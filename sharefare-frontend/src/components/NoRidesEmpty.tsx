import { CarFront } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function NoRidesEmpty({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={CarFront}
      title="No rides found"
      description="Try nearby routes like your college, metro station, tech parks, or residential areas."
      actionLabel={onClear ? "Clear filters" : undefined}
      onAction={onClear}
    />
  );
}
