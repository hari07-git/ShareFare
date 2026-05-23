import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../state/auth";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { GradientButton } from "./GradientButton";
import { Bell, LayoutDashboard, LogIn, LogOut, MapPinned, Menu, Plus, Search, Shield, ShieldCheck, X, Users, TrendingUp } from "lucide-react";

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-slate-100 text-slate-950 after:absolute after:inset-x-3 after:-bottom-1 after:h-px after:bg-blue-600"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function MobileNavItem({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
          isActive
            ? "bg-indigo-50 text-indigo-700 font-bold"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function ProfileAvatar({ name, verified, avatarUrl, size = "sm" }: { name: string; verified?: boolean; avatarUrl?: string | null; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sz = size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  return (
    <span className="relative inline-flex shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sz} rounded-full object-cover ring-2 ring-white shadow-sm`}
        />
      ) : (
        <span className={`${sz} inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-bold text-white ring-2 ring-white shadow-sm`}>
          {initials}
        </span>
      )}
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-1 ring-white">
          <ShieldCheck className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
        </span>
      )}
    </span>
  );
}

export function Navbar() {
  const { token, logout, me } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const isVerified = me?.accountStatus === "VERIFIED_STUDENT";

  useEffect(() => {
    if (me?.id) {
      const stored = localStorage.getItem(`profile_avatar_${me.id}`);
      setAvatarUrl(stored ?? null);

      // Listen for avatar changes from ProfilePage (same tab via custom event)
      const handleAvatarUpdate = () => {
        const updated = localStorage.getItem(`profile_avatar_${me.id}`);
        setAvatarUrl(updated ?? null);
      };
      window.addEventListener(`avatar-updated-${me.id}`, handleAvatarUpdate);
      // Also listen for storage events from other tabs
      window.addEventListener("storage", handleAvatarUpdate);
      return () => {
        window.removeEventListener(`avatar-updated-${me.id}`, handleAvatarUpdate);
        window.removeEventListener("storage", handleAvatarUpdate);
      };
    } else {
      setAvatarUrl(null);
    }
  }, [me?.id]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) { setUnread(0); return; }
      try {
        const res = await api.get<{ unread: number }>("/api/me/notifications/unread-count");
        if (!cancelled) setUnread(res.data.unread);
      } catch {
        if (!cancelled) setUnread(0);
      }
    }
    void load();
    const id = window.setInterval(load, 15000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [token]);

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {token ? (
              <>
                <NavItem to="/home">
                  <span className="inline-flex items-center gap-1.5"><LayoutDashboard className="h-3.5 w-3.5" /> Home</span>
                </NavItem>
                <NavItem to="/rides/find">
                  <span className="inline-flex items-center gap-1.5"><Search className="h-3.5 w-3.5" /> Find a ride</span>
                </NavItem>
                <NavItem to="/rides/offer">
                  <span className="inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Offer a ride</span>
                </NavItem>
                <NavItem to="/my-bookings">
                  <span className="inline-flex items-center gap-1.5"><MapPinned className="h-3.5 w-3.5" /> My Trips</span>
                </NavItem>
                <NavLink
                  to="/me/notifications"
                  className={({ isActive }) =>
                    cn("relative rounded-xl px-3 py-2 text-sm font-semibold transition",
                      isActive ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    )
                  }
                >
                  <span className="inline-flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications</span>
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </NavLink>
              </>
            ) : (
              <>
                <NavItem to="/rides/find">Find a ride</NavItem>
                <NavItem to="/rides/offer">Offer a ride</NavItem>
              </>
            )}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-2 md:flex">
            {token ? (
              <>
                {/* Profile Avatar Button */}
                <Link
                  to="/me/profile"
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <ProfileAvatar name={me?.fullName ?? "SF"} verified={isVerified} avatarUrl={avatarUrl} />
                  <span className="hidden max-w-[100px] truncate lg:block">{me?.fullName?.split(" ")[0] ?? "Profile"}</span>
                </Link>
                <GradientButton
                  variant="ghost"
                  onClick={() => { logout(); navigate("/rides/find"); }}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </GradientButton>
              </>
            ) : (
              <>
                <GradientButton variant="ghost" onClick={() => navigate("/auth/login")}>
                  <LogIn className="h-4 w-4" /> Login
                </GradientButton>
                <GradientButton onClick={() => navigate("/auth/register")}>Sign up</GradientButton>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-900 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {open && (
        <div className="border-b border-slate-200 bg-white/98 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {token ? (
              <>
                {/* Profile row at top of mobile menu */}
                <Link
                  to="/me/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 mb-3"
                >
                   <ProfileAvatar name={me?.fullName ?? "SF"} verified={isVerified} avatarUrl={avatarUrl} size="md" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{me?.fullName}</div>
                    <div className="text-xs text-slate-500">{isVerified ? "✓ Verified Student" : "Pending verification"}</div>
                  </div>
                </Link>
                <MobileNavItem to="/home" onClick={() => setOpen(false)}>Home</MobileNavItem>
                <MobileNavItem to="/rides/find" onClick={() => setOpen(false)}>Find a ride</MobileNavItem>
                <MobileNavItem to="/rides/offer" onClick={() => setOpen(false)}>Offer a ride</MobileNavItem>
                <MobileNavItem to="/my-bookings" onClick={() => setOpen(false)}>My Trips</MobileNavItem>
                <MobileNavItem to="/me/notifications" onClick={() => setOpen(false)}>
                  Notifications {unread > 0 && <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white">{unread}</span>}
                </MobileNavItem>
                <MobileNavItem to="/me/profile" onClick={() => setOpen(false)}>My Profile</MobileNavItem>
                <div className="pt-2">
                  <GradientButton
                    variant="ghost"
                    onClick={() => { logout(); setOpen(false); navigate("/rides/find"); }}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </GradientButton>
                </div>
              </>
            ) : (
              <>
                <MobileNavItem to="/rides/find" onClick={() => setOpen(false)}>Find a ride</MobileNavItem>
                <MobileNavItem to="/rides/offer" onClick={() => setOpen(false)}>Offer a ride</MobileNavItem>
                <div className="pt-2 grid gap-2">
                  <GradientButton onClick={() => { navigate("/auth/register"); setOpen(false); }}>Sign up</GradientButton>
                  <GradientButton variant="ghost" onClick={() => { navigate("/auth/login"); setOpen(false); }}>Login</GradientButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
