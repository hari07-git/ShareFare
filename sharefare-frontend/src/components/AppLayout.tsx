import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { ErrorBoundary } from "./ErrorBoundary";
import { Footer } from "./Footer";

export function AppLayout() {
  const location = useLocation();
  return (
    <div className="min-h-full text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="relative">
          <div className="pointer-events-none absolute -top-16 left-0 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -top-10 right-6 h-60 w-60 rounded-full bg-cyan-400/12 blur-3xl" />
          <ErrorBoundary>
            <div key={location.pathname} className="sf-animate-in">
              <Outlet />
            </div>
          </ErrorBoundary>
        </div>
        <Footer className="pb-10" />
      </main>
    </div>
  );
}
