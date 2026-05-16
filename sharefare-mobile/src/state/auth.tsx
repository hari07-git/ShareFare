import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  token: string | null;
  ready: boolean;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

const KEY = "sharefare.jwt";

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const t = await AsyncStorage.getItem(KEY);
        if (!cancelled) setTokenState(t);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      ready,
      setToken: async (t) => {
        if (t) await AsyncStorage.setItem(KEY, t);
        else await AsyncStorage.removeItem(KEY);
        setTokenState(t);
      },
      logout: async () => {
        await AsyncStorage.removeItem(KEY);
        setTokenState(null);
      }
    }),
    [token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

