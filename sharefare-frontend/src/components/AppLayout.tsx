import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { ErrorBoundary } from "./ErrorBoundary";

export function AppLayout() {
  const location = useLocation();
  return (
    <div className="min-h-full text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="relative">
          <div className="pointer-events-none absolute -top-10 left-0 h-40 w-40 rounded-full bg-indigo-400/10 blur-2xl" />
          <div className="pointer-events-none absolute -top-6 right-6 h-44 w-44 rounded-full bg-emerald-400/10 blur-2xl" />
          <ErrorBoundary>
            <div key={location.pathname} className="sf-animate-in">
              <Outlet />
            </div>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
