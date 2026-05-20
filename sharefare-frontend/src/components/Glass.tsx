import React from "react";
import { cn } from "../lib/cn";

export function Glass({
  children,
  className,
  as: As = "div"
}: {
  children: React.ReactNode;
  className?: string;
  as?: any;
}) {
  return (
    <As
      className={cn(
        "rounded-2xl border border-slate-200 bg-white/85 shadow-sm backdrop-blur",
        className
      )}
    >
      {children}
    </As>
  );
}
