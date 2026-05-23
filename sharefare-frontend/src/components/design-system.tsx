import React from "react";
import { NavLink } from "react-router-dom";
import { Bell, Home, MapPinned, Plus, Search, Users, LayoutDashboard } from "lucide-react";
import { cn } from "../lib/cn";

export const pageContainer = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
export const sectionSpacing = "space-y-6 md:space-y-8";
export const cardStyle = "rounded-2xl border border-slate-200 bg-white shadow-sm";
export const fieldStyle =
  "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</div>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
  className
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(cardStyle, "p-5", className)}>
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function StatsCard({
  label,
  value,
  helper,
  icon: Icon
}: {
  label: string;
  value: React.ReactNode;
  helper?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className={cn(cardStyle, "p-4 transition hover:-translate-y-0.5 hover:shadow-md")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-600">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</div>
          {helper ? <div className="mt-1 text-xs text-slate-500">{helper}</div> : null}
        </div>
        {Icon ? (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SearchBar({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(cardStyle, "p-4 shadow-lg", className)}>{children}</div>;
}

export function MapPanel({
  title,
  children,
  className
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(cardStyle, "overflow-hidden p-3", className)}>
      {title ? <div className="px-2 pb-3 text-sm font-semibold text-slate-950">{title}</div> : null}
      {children}
    </section>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
          <button className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

import { useAuth } from "../state/auth";

const mobileItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/rides/find", label: "Find", icon: Search },
  { to: "/my-booked-rides", label: "Trips", icon: MapPinned },
  { to: "/driver/booking-requests", label: "Requests", icon: Users },
  { to: "/my-offered-rides", label: "Offered", icon: LayoutDashboard },
];

export function MobileBottomNavigation({ enabled }: { enabled: boolean }) {
  const { me } = useAuth();
  const initials = (me?.fullName ?? "SF")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!enabled) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] shadow-[0_-12px_35px_-28px_rgba(15,23,42,0.5)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-0.5">
        {mobileItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition",
                isActive
                  ? "text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-xl transition",
                  isActive ? "bg-indigo-100" : ""
                )}>
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
        {/* Profile tab */}
        <NavLink
          to="/me/profile"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition",
              isActive ? "text-indigo-600" : "text-slate-500"
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-xl text-[10px] font-black transition",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-gradient-to-br from-indigo-500 to-violet-500 text-white"
              )}>
                {initials}
              </span>
              Profile
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
