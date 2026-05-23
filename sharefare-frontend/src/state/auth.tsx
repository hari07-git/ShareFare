import React from "react";
import { clearToken, getToken, setToken } from "./authStorage";
import { api } from "../lib/api";

type AuthUser = {
  id?: number;
  email: string;
  role: string;
  fullName: string;
  emailVerified?: boolean;
  accountStatus?: string;
  collegeVerified?: boolean;
};

type AuthState = {
  token: string | null;
  me: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = React.createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenState, setTokenState] = React.useState<string | null>(() => getToken());
  const [me, setMe] = React.useState<AuthState["me"]>(null);

  const refreshMe = React.useCallback(async () => {
    if (!tokenState) {
      setMe(null);
      return;
    }
    try {
      const res = await api.get("/api/me");
      setMe({
        id: res.data.id,
        email: res.data.email,
        role: res.data.role,
        fullName: res.data.fullName,
        emailVerified: res.data.emailVerified,
        accountStatus: res.data.accountStatus,
        collegeVerified: res.data.collegeVerified,
      });
    } catch {
      clearToken();
      setTokenState(null);
      setMe(null);
    }
  }, [tokenState]);

  React.useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const value: AuthState = {
    token: tokenState,
    me,
    login: (token) => {
      setToken(token);
      setTokenState(token);
    },
    logout: () => {
      clearToken();
      setTokenState(null);
      setMe(null);
    },
    refreshMe
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
