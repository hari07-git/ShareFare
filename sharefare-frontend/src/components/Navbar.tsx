import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

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
        `rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm"
            : "text-slate-700 hover:bg-white/70 hover:shadow-sm"
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
    <header className="sticky top-0 z-10 border-b border-white/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-sm">
            SF
          </span>
          <span>ShareFare</span>
        </Link>

        <nav className="flex items-center gap-2">
          {token ? <NavItem to="/home">Home</NavItem> : null}
          <NavItem to="/rides/find">Find Ride</NavItem>
          {token ? (
            <>
              <NavItem to="/rides/offer">Offer Ride</NavItem>
              {me?.role === "DRIVER" || me?.role === "ADMIN" ? (
                <NavItem to="/me/driver/inbox">Inbox</NavItem>
              ) : null}
              <NavItem to="/me/bookings">My Bookings</NavItem>
              <NavLink
                to="/me/notifications"
                className={({ isActive }) =>
                  `relative rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm"
                      : "text-slate-700 hover:bg-white/70 hover:shadow-sm"
                  }`
                }
              >
                Notifications
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                ) : null}
              </NavLink>
              <NavItem to="/me/profile">Profile</NavItem>
              {me?.role === "ADMIN" ? <NavItem to="/admin">Admin</NavItem> : null}
              <button
                onClick={() => {
                  logout();
                  navigate("/rides/find");
                }}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/70 hover:shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavItem to="/auth/login">Login</NavItem>
              <NavItem to="/auth/register">Register</NavItem>
              <NavItem to="/admin/login">Admin</NavItem>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
