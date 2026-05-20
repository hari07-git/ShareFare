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
      ? "border border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
      : variant === "danger"
        ? "border border-rose-600 bg-rose-600 text-white shadow-sm hover:bg-rose-500"
        : variant === "ghost"
          ? "border border-slate-200 bg-white/70 text-slate-800 hover:border-slate-300 hover:bg-white"
          : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50";

  return (
    <button
      {...props}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-tight transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        styles,
        className
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
      <span className="relative">{props.children}</span>
    </button>
  );
}
