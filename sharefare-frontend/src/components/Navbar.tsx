import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { GradientButton } from "./GradientButton";
import { Bell, LayoutDashboard, LogIn, LogOut, MapPinned, Menu, Plus, Search, Shield, ShieldCheck, X } from "lucide-react";

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

function ProfileAvatar({ name, verified, size = "sm" }: { name: string; verified?: boolean; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sz = size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  return (
    <span className="relative inline-flex shrink-0">
      <span className={`${sz} inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-bold text-white ring-2 ring-white shadow-sm`}>
        {initials}
      </span>
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

  const isVerified = me?.accountStatus === "VERIFIED_STUDENT";

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
          <Link to="/" className="flex items-center gap-0 group select-none">
            {/* Orange S with car cutout */}
            <span className="relative inline-flex items-center justify-center shrink-0 scale-90 sm:scale-100 origin-left" style={{ width: 44, height: 52 }}>
              <svg viewBox="0 0 44 52" width="44" height="52" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Orange S letter */}
                <text
                  x="2" y="46"
                  fontFamily="'Georgia', 'Times New Roman', serif"
                  fontWeight="900"
                  fontSize="54"
                  fill="#f04e12"
                  letterSpacing="-4"
                >S</text>
                {/* Car silhouette cutout — white car body */}
                <rect x="4" y="22" width="36" height="10" rx="3" fill="white" opacity="0.95"/>
                {/* Car roof */}
                <rect x="10" y="16" width="20" height="9" rx="3" fill="white" opacity="0.95"/>
                {/* Windshield (slight tint) */}
                <rect x="11" y="17" width="8" height="7" rx="1.5" fill="#f0e8e0" opacity="0.8"/>
                <rect x="21" y="17" width="8" height="7" rx="1.5" fill="#f0e8e0" opacity="0.8"/>
                {/* Left wheel */}
                <circle cx="12" cy="32" r="4.5" fill="#1a1a1a"/>
                <circle cx="12" cy="32" r="2" fill="#888"/>
                {/* Right wheel */}
                <circle cx="32" cy="32" r="4.5" fill="#1a1a1a"/>
                <circle cx="32" cy="32" r="2" fill="#888"/>
                {/* Horizontal speed stripe */}
                <rect x="0" y="27" width="44" height="2" fill="#f04e12" opacity="0.25"/>
              </svg>
            </span>

            {/* Text: "hare" + "FARE" stacked */}
            <div className="ml-0.5 leading-none">
              <div className="flex items-baseline gap-0">
                <span className="text-[22px] font-black tracking-tight text-slate-900" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>hare</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-black tracking-[0.06em] text-[#f04e12]" style={{ fontFamily: "'Inter', sans-serif" }}>FARE</span>
                <span className="hidden text-[9px] font-semibold tracking-[0.12em] text-slate-400 sm:block" style={{ fontFamily: "'Inter', sans-serif" }}>HYDERABAD CAMPUS RIDES</span>
              </div>
            </div>
          </Link>

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
                <NavItem to="/me/bookings">
                  <span className="inline-flex items-center gap-1.5"><MapPinned className="h-3.5 w-3.5" /> My bookings</span>
                </NavItem>
                <NavLink
                  to="/me/notifications"
                  className={({ isActive }) =>
                    cn("relative rounded-2xl px-3 py-2 text-sm font-semibold transition",
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
                {me?.role === "ADMIN" && (
                  <NavItem to="/admin">
                    <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Admin</span>
                  </NavItem>
                )}
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
                  <ProfileAvatar name={me?.fullName ?? "SF"} verified={isVerified} />
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
                  <ProfileAvatar name={me?.fullName ?? "SF"} verified={isVerified} size="md" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{me?.fullName}</div>
                    <div className="text-xs text-slate-500">{isVerified ? "✓ Verified Student" : "Pending verification"}</div>
                  </div>
                </Link>
                <MobileNavItem to="/home" onClick={() => setOpen(false)}>Home</MobileNavItem>
                <MobileNavItem to="/rides/find" onClick={() => setOpen(false)}>Find a ride</MobileNavItem>
                <MobileNavItem to="/rides/offer" onClick={() => setOpen(false)}>Offer a ride</MobileNavItem>
                <MobileNavItem to="/me/bookings" onClick={() => setOpen(false)}>My bookings</MobileNavItem>
                <MobileNavItem to="/me/notifications" onClick={() => setOpen(false)}>
                  Notifications {unread > 0 && <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white">{unread}</span>}
                </MobileNavItem>
                <MobileNavItem to="/me/profile" onClick={() => setOpen(false)}>My Profile</MobileNavItem>
                {me?.role === "ADMIN" && <MobileNavItem to="/admin" onClick={() => setOpen(false)}>Admin</MobileNavItem>}
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
