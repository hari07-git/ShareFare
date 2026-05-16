import React from "react";
import { cn } from "../lib/cn";

export function GradientButton({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-[0_18px_50px_-18px_rgba(37,99,235,0.65)] hover:shadow-[0_22px_60px_-18px_rgba(34,211,238,0.55)]"
      : variant === "danger"
        ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-[0_18px_50px_-18px_rgba(244,63,94,0.55)]"
        : variant === "ghost"
          ? "bg-white/0 text-white hover:bg-white/10 border border-white/15"
          : "bg-white/90 text-slate-900 hover:bg-white border border-white/60";

  return (
    <button
      {...props}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60",
        styles,
        className
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(80%_120%_at_50%_0%,rgba(255,255,255,0.25),transparent_70%)]" />
      <span className="relative">{props.children}</span>
    </button>
  );
}

