function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`rounded-full bg-slate-200 ${className}`} />;
}

export function RideCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <SkeletonLine className="h-4 w-2/3" />
          <SkeletonLine className="h-3 w-1/2 bg-slate-100" />
          <SkeletonLine className="h-3 w-3/4 bg-slate-100" />
        </div>
        <SkeletonLine className="h-8 w-16" />
      </div>
      <div className="mt-4 flex gap-2">
        <SkeletonLine className="h-7 w-20 bg-slate-100" />
        <SkeletonLine className="h-7 w-24 bg-slate-100" />
        <SkeletonLine className="h-7 w-16 bg-slate-100" />
      </div>
    </div>
  );
}

export function BookingSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="mt-3 h-3 w-1/2 bg-slate-100" />
      <SkeletonLine className="mt-3 h-3 w-3/4 bg-slate-100" />
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex justify-between gap-4">
        <SkeletonLine className="h-4 w-48" />
        <SkeletonLine className="h-4 w-20 bg-slate-100" />
      </div>
      <SkeletonLine className="mt-3 h-3 w-4/5 bg-slate-100" />
      <SkeletonLine className="mt-2 h-3 w-2/3 bg-slate-100" />
    </div>
  );
}
