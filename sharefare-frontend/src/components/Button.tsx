import React from "react";

export function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const cls =
    variant === "primary"
      ? "bg-gradient-to-r from-indigo-600 to-sky-500 text-white hover:from-indigo-500 hover:to-sky-400 shadow-sm"
      : variant === "danger"
        ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:from-rose-500 hover:to-orange-400 shadow-sm"
        : "bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-sm";

  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${cls} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
