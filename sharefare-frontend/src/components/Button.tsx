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
      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 shadow-[0_18px_50px_-18px_rgba(37,99,235,0.55)]"
      : variant === "danger"
        ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:from-rose-500 hover:to-orange-400 shadow-[0_18px_50px_-18px_rgba(244,63,94,0.55)]"
        : "bg-white/90 text-slate-900 hover:bg-white border border-white/60 shadow-[0_18px_50px_-30px_rgba(2,6,23,0.35)]";

  return (
    <button
      {...props}
      className={`group relative rounded-2xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-200/50 transition ${cls} ${props.className ?? ""}`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(80%_120%_at_50%_0%,rgba(255,255,255,0.22),transparent_70%)]" />
      {children}
    </button>
  );
}
