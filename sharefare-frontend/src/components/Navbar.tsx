import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import { GradientButton } from "./GradientButton";
import { Bell, LayoutDashboard, LogIn, LogOut, MapPinned, Menu, Plus, Search, Shield } from "lucide-react";

function NavItem({
  to,
  children
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-2xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-white/12 text-white shadow-[0_14px_45px_-30px_rgba(2,6,23,0.8)]"
            : "text-slate-200/80 hover:bg-white/8 hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export function Navbar() {
  const { token, logout, me } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState<number>(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setUnread(0);
        return;
      }
      try {
        const res = await api.get<{ unread: number }>("/api/me/notifications/unread-count");
        if (!cancelled) setUnread(res.data.unread);
      } catch {
        if (!cancelled) setUnread(0);
      }
    }
    void load();
    const id = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [token]);

  return (
    <header className="sticky top-0 z-20">
      <div className="border-b border-white/10 bg-[#070c16]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-[0_18px_60px_-35px_rgba(34,211,238,0.7)]">
              <span className="text-sm font-black tracking-tight">SF</span>
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(65%_75%_at_35%_20%,rgba(255,255,255,0.25),transparent_65%)]" />
            </span>
            <div className="leading-none">
              <div className="text-[15px] font-semibold tracking-tight text-white">ShareFare</div>
              <div className="mt-0.5 hidden text-[11px] font-medium text-slate-300/80 sm:block">
                Hyderabad campus rides
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {token ? (
              <>
                <NavItem to="/home">
                  <span className="inline-flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Home
                  </span>
                </NavItem>
                <NavItem to="/rides/find">
                  <span className="inline-flex items-center gap-2">
                    <Search className="h-4 w-4" /> Find a ride
                  </span>
                </NavItem>
                <NavItem to="/rides/offer">
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Offer a ride
                  </span>
                </NavItem>
                <NavItem to="/me/bookings">
                  <span className="inline-flex items-center gap-2">
                    <MapPinned className="h-4 w-4" /> My bookings
                  </span>
                </NavItem>
                <NavLink
                  to="/me/notifications"
                  className={({ isActive }) =>
                    cn(
                      "relative rounded-2xl px-3 py-2 text-sm font-semibold transition",
                      isActive
                        ? "bg-white/12 text-white shadow-[0_14px_45px_-30px_rgba(2,6,23,0.8)]"
                        : "text-slate-200/80 hover:bg-white/8 hover:text-white"
                    )
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Notifications
                  </span>
                  {unread > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                </NavLink>
                {me?.role === "ADMIN" ? (
                  <NavItem to="/admin">
                    <span className="inline-flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Admin
                    </span>
                  </NavItem>
                ) : null}
              </>
            ) : (
              <>
                <NavItem to="/rides/find">Find a ride</NavItem>
                <NavItem to="/rides/offer">Offer a ride</NavItem>
              </>
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {token ? (
              <GradientButton
                variant="ghost"
                onClick={() => {
                  logout();
                  navigate("/rides/find");
                }}
              >
                <LogOut className="h-4 w-4" /> Logout
              </GradientButton>
            ) : (
              <>
                <GradientButton
                  variant="ghost"
                  onClick={() => navigate("/auth/login")}
                >
                  <LogIn className="h-4 w-4" /> Login
                </GradientButton>
                <GradientButton onClick={() => navigate("/auth/register")}>Sign up</GradientButton>
              </>
            )}
          </div>

          <button
            className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 p-2.5 text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-b border-white/10 bg-[#070c16]/75 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="grid gap-2">
              {token ? (
                <>
                  <NavItem to="/home">Home</NavItem>
                  <NavItem to="/rides/find">Find a ride</NavItem>
                  <NavItem to="/rides/offer">Offer a ride</NavItem>
                  <NavItem to="/me/bookings">My bookings</NavItem>
                  <NavItem to="/me/notifications">Notifications</NavItem>
                  {me?.role === "ADMIN" ? <NavItem to="/admin">Admin</NavItem> : null}
                  <GradientButton
                    variant="ghost"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate("/rides/find");
                    }}
                  >
                    Logout
                  </GradientButton>
                </>
              ) : (
                <>
                  <NavItem to="/rides/find">Find a ride</NavItem>
                  <NavItem to="/rides/offer">Offer a ride</NavItem>
                  <GradientButton onClick={() => navigate("/auth/register")}>Sign up</GradientButton>
                  <GradientButton variant="ghost" onClick={() => navigate("/auth/login")}>
                    Login
                  </GradientButton>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
