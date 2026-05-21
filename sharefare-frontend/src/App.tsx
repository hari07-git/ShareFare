import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { RequireAuth } from "./components/RequireAuth";
import { useAuth } from "./state/auth";

const LandingPage = lazy(() => import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })));
const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })));
const VerifyOtpPage = lazy(() => import("./pages/VerifyOtpPage").then((m) => ({ default: m.VerifyOtpPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const FindRidePage = lazy(() => import("./pages/FindRidePage").then((m) => ({ default: m.FindRidePage })));
const OfferRidePage = lazy(() => import("./pages/OfferRidePage").then((m) => ({ default: m.OfferRidePage })));
const MyBookingsPage = lazy(() => import("./pages/MyBookingsPage").then((m) => ({ default: m.MyBookingsPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const RideDetailsPage = lazy(() => import("./pages/RideDetailsPage").then((m) => ({ default: m.RideDetailsPage })));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })));
const AdminVerificationQueuePage = lazy(() => import("./pages/AdminVerificationQueuePage").then((m) => ({ default: m.AdminVerificationQueuePage })));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })));
const DriverInboxPage = lazy(() => import("./pages/DriverInboxPage").then((m) => ({ default: m.DriverInboxPage })));
const TermsPage = lazy(() => import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage").then((m) => ({ default: m.CookiePolicyPage })));

function PageLoader() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Loading ShareFare...
      </div>
    </div>
  );
}

export default function App() {
  const { token } = useAuth();
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={token ? <Navigate to="/home" replace /> : <LandingPage />} />
          <Route
            path="/home"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />

          <Route path="/rides/find" element={<FindRidePage />} />
          <Route path="/rides/:rideId" element={<RideDetailsPage />} />

          <Route
            path="/rides/offer"
            element={
              <RequireAuth>
                <OfferRidePage />
              </RequireAuth>
            }
          />
          <Route
            path="/me/bookings"
            element={
              <RequireAuth>
                <MyBookingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/me/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/me/notifications"
            element={
              <RequireAuth>
                <NotificationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/me/driver/inbox"
            element={
              <RequireAuth roles={["USER", "ADMIN"]}>
                <DriverInboxPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth roles={["ADMIN"]}>
                <AdminDashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/verification"
            element={
              <RequireAuth roles={["ADMIN"]}>
                <AdminVerificationQueuePage />
              </RequireAuth>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/rides/find" replace />} />
      </Routes>
    </Suspense>
  );
}
