import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { ErrorBoundary } from "./ErrorBoundary";
import { Footer } from "./Footer";
import { MobileBottomNavigation, pageContainer } from "./design-system";
import { useAuth } from "../state/auth";
import { cn } from "../lib/cn";
import { ToastHost } from "./Toast";

export function AppLayout() {
  const location = useLocation();
  const { token } = useAuth();
  return (
    <div className="min-h-full text-slate-900">
      <Navbar />
      <main className={cn("relative py-6 pb-24 md:pb-6", pageContainer)}>
        <div className="pointer-events-none fixed inset-0 sf-grid-overlay opacity-30" />
        <div className="relative">
          <ErrorBoundary>
            <div key={location.pathname} className="sf-animate-in">
              <Outlet />
            </div>
          </ErrorBoundary>
        </div>
        <Footer className="pb-10" />
      </main>
      <MobileBottomNavigation enabled={Boolean(token)} />
      <ToastHost />
    </div>
  );
}
