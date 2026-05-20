import React from "react";
import { cn } from "../lib/cn";
import { BadgeCheck, ShieldCheck, Star, Users, Zap } from "lucide-react";

const TRUST_STATS = [
  { label: "Active students", value: "50k+", icon: Users },
  { label: "Avg rating", value: "4.9★", icon: Star },
  { label: "Routes live", value: "120+", icon: Zap },
  { label: "Verified only", value: "100%", icon: ShieldCheck },
];

const TRUST_BADGES = [
  { icon: BadgeCheck, text: "Campus ID verified" },
  { icon: ShieldCheck, text: "Safety-first platform" },
  { icon: Zap, text: "Zero commission fares" },
];

export function AuthShell({
  title,
  subtitle,
  children,
  sideTitle = "Your trusted campus mobility network",
  sideBody = "Verified rides for smarter student travel across Hyderabad — colleges, metro, tech parks.",
  className
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  sideTitle?: string;
  sideBody?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-5xl", className)}>
      <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">

        {/* LEFT — form panel */}
        <div className="p-6 md:p-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            ShareFare access
          </div>
          <div className="mt-5 text-3xl font-black tracking-tight text-slate-950">{title}</div>
          <div className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</div>
          <div className="mt-7">{children}</div>
        </div>

        {/* RIGHT — cinematic image panel */}
        <div className="relative hidden md:block">
          {/* Premium campus image */}
          <img
            src="/images/auth-campus.png"
            alt="Campus students commuting in Hyderabad"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark gradient overlay — stronger at top and bottom */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-indigo-950/65 to-slate-900/85" />

          {/* Subtle purple glow */}
          <div className="pointer-events-none absolute -right-10 top-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-10 left-5 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl" />

          {/* Content over image */}
          <div className="relative flex h-full flex-col justify-between p-8 text-white">
            {/* Top — headline */}
            <div>
              <div className="text-2xl font-black leading-snug tracking-tight">
                {sideTitle}
              </div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
                {sideBody}
              </p>

              {/* Trust badges */}
              <div className="mt-6 space-y-2.5">
                {TRUST_BADGES.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 ring-1 ring-indigo-400/30">
                      <Icon className="h-3.5 w-3.5 text-indigo-300" />
                    </span>
                    <span className="text-sm font-semibold text-white/85">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom — stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {TRUST_STATS.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur transition hover:bg-white/15"
                >
                  <Icon className="h-4 w-4 text-indigo-300" />
                  <div className="mt-2 text-2xl font-black text-white">{value}</div>
                  <div className="mt-0.5 text-xs font-medium text-white/60">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
