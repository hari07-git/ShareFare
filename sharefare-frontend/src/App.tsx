import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { RequireAuth } from "./components/RequireAuth";
import { LandingPage } from "./pages/LandingPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { FindRidePage } from "./pages/FindRidePage";
import { OfferRidePage } from "./pages/OfferRidePage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RideDetailsPage } from "./pages/RideDetailsPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { DriverInboxPage } from "./pages/DriverInboxPage";
import { useAuth } from "./state/auth";

export default function App() {
  const { token } = useAuth();
  return (
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
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

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
            <RequireAuth>
              <DriverInboxPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboardPage />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/rides/find" replace />} />
    </Routes>
  );
}
