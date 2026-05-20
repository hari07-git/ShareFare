import React from "react";
import { cn } from "../lib/cn";

export function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const cls =
    variant === "primary"
      ? "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
      : variant === "danger"
        ? "border border-rose-600 bg-rose-600 text-white hover:bg-rose-500 shadow-sm"
        : "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-sm";

  return (
    <button
      {...props}
      className={cn(
        "group relative rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-500/10",
        cls,
        props.className
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
      {children}
    </button>
  );
}
