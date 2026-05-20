import { Navigate } from "react-router-dom";
import { useAuth } from "../state/auth";

export function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { token, me } = useAuth();
  if (!token) return <Navigate to="/auth/login" replace />;
  if (roles && me && !roles.includes(me.role)) return <Navigate to="/home" replace />;
  return <>{children}</>;
}
