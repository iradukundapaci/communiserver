"use client";

import {
  clearAuthTokens,
  getUserFromToken,
  isAuthenticated,
  isTokenExpired,
  refreshTokens,
} from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to check authentication and refresh token if needed
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      if (!isAuthenticated()) {
        setIsLoading(false);
        return false;
      }

      // Check if token is expired
      if (isTokenExpired()) {
        // Try to refresh the token
        await refreshTokens();
      }

      // Get user info from token
      const userInfo = getUserFromToken();
      if (userInfo) {
        setUser(userInfo);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Authentication check failed:", error);
      clearAuthTokens();
      setIsLoading(false);
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuthTokens();
    setUser(null);
    router.push("/");
    toast.success("Logged out successfully");
  }, [router]);

  // Check authentication on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up token refresh interval
  useEffect(() => {
    // Check token every minute
    const interval = setInterval(async () => {
      if (isAuthenticated() && isTokenExpired()) {
        try {
          await refreshTokens();
          // Update user info after token refresh
          const userInfo = getUserFromToken();
          if (userInfo) {
            setUser(userInfo);
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          clearAuthTokens();
          setUser(null);
          router.push("/");
          toast.error("Your session has expired. Please log in again.");
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
