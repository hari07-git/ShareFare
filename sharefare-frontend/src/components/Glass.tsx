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
        "rounded-3xl border border-white/15 bg-white/10 shadow-[0_30px_80px_-40px_rgba(2,6,23,0.65)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </As>
  );
}

