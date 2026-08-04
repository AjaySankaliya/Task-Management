"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe, logoutUser, type User } from "@/api/auth.api";
import { clearAuthTokens } from "@/lib/axios";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      setLoading(true);

      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setUser(null);
        return;
      }

      const response = await getMe();
      setUser(response.user ?? null);
    } catch {
      clearAuthTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleLogoutEvent = () => {
      clearAuthTokens();
      setUser(null);
      setLoading(false);
    };

    const handleLoginEvent = () => {
      void refreshAuth();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth:logout", handleLogoutEvent);
      window.addEventListener("auth:login", handleLoginEvent);
    }

    const init = window.setTimeout(() => {
      void refreshAuth();
    }, 0);

    return () => {
      if (typeof window !== "undefined") {
        window.clearTimeout(init);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("auth:logout", handleLogoutEvent);
        window.removeEventListener("auth:login", handleLoginEvent);
      }
    };
  }, [refreshAuth]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout API failures and continue clearing the client session.
    } finally {
      clearAuthTokens();
      setUser(null);
      router.replace("/login");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
  }, [router]);

  const value = useMemo<AuthContextType>(
    () => ({ user, loading, logout }),
    [user, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}