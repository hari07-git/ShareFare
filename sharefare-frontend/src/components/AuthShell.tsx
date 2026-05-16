import React from "react";
import { cn } from "../lib/cn";

export function AuthShell({
  title,
  subtitle,
  children,
  sideTitle = "Join the movement",
  sideBody = "Create your account and become part of Hyderabad’s student ride‑sharing community.",
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
      <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-[#060a12]/55 shadow-[0_70px_200px_-140px_rgba(2,6,23,0.95)] backdrop-blur-xl md:grid-cols-2">
        <div className="p-6 md:p-10">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200/90">
            ShareFare access
          </div>
          <div className="mt-4 text-3xl font-semibold tracking-tight text-white">{title}</div>
          <div className="mt-2 text-sm text-slate-300/90">{subtitle}</div>
          <div className="mt-7">{children}</div>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 via-indigo-600/65 to-cyan-500/55" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_20%,rgba(255,255,255,0.22),transparent_60%)]" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <div>
              <div className="text-2xl font-semibold">{sideTitle}</div>
              <div className="mt-3 max-w-sm text-sm text-white/90">{sideBody}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4">
                <div className="text-xs text-white/80">Active students</div>
                <div className="mt-1 text-2xl font-semibold">50k+</div>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-4">
                <div className="text-xs text-white/80">Avg rating</div>
                <div className="mt-1 text-2xl font-semibold">4.9★</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

