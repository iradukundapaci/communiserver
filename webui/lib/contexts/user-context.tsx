"use client";

import { getProfile, User } from "@/lib/api/users";
import React, { createContext, useContext, useEffect, useState, useRef } from "react";

// Global debounce mechanism to prevent infinite loops
class UserFetchDebouncer {
  private static instance: UserFetchDebouncer;
  private lastFetchTime = 0;
  private isCurrentlyFetching = false;
  private fetchCount = 0;
  private resetTime = 0;

  static getInstance(): UserFetchDebouncer {
    if (!UserFetchDebouncer.instance) {
      UserFetchDebouncer.instance = new UserFetchDebouncer();
    }
    return UserFetchDebouncer.instance;
  }

  canFetch(): boolean {
    const now = Date.now();

    // Reset counter every 30 seconds
    if (now - this.resetTime > 30000) {
      this.fetchCount = 0;
      this.resetTime = now;
    }

    // If already fetching, don't allow another fetch
    if (this.isCurrentlyFetching) {
      console.log("⏳ User fetch already in progress, skipping...");
      return false;
    }

    // Debounce: don't allow fetches within 2 seconds of each other
    if (now - this.lastFetchTime < 2000) {
      console.log("⏱️ User fetch debounced (too soon since last fetch)");
      return false;
    }

    // Circuit breaker: max 3 fetches per 30 seconds
    if (this.fetchCount >= 3) {
      console.log("🚫 User fetch circuit breaker: too many fetches in 30 seconds");
      return false;
    }

    this.fetchCount++;
    this.lastFetchTime = now;
    console.log(`✅ User fetch allowed (${this.fetchCount}/3 in current window)`);
    return true;
  }

  startFetch(): void {
    this.isCurrentlyFetching = true;
  }

  endFetch(): void {
    this.isCurrentlyFetching = false;
  }
}

const userFetchDebouncer = UserFetchDebouncer.getInstance();

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
  hasValidToken: () => boolean;
  fetchUserForPage: (pageName: string) => Promise<void>;
  manualRefresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const hasInitialized = useRef(false);

  // Check if there's a valid token in localStorage
  const hasValidToken = (): boolean => {
    try {
      const token = localStorage.getItem("access_token");
      return !!token;
    } catch {
      return false;
    }
  };

  // Load user from localStorage without API call
  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("📦 User loaded from localStorage");
        return true;
      }
    } catch (err) {
      console.error("❌ Failed to load user from localStorage:", err);
    }
    return false;
  };

  // Fetch user profile from API with debouncing
  const fetchUserProfile = async (forceFetch = false) => {
    // Check debouncer unless forced
    if (!forceFetch && !userFetchDebouncer.canFetch()) {
      // If debounced, load from storage instead
      loadUserFromStorage();
      return;
    }

    try {
      userFetchDebouncer.startFetch();
      setIsLoading(true);
      setError(null);
      console.log(`📡 Fetching user profile`);

      // Fetch fresh data from the server
      const profile = await getProfile();

      // Update state and localStorage
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      console.log("✅ User profile fetched successfully");
    } catch (err) {
      console.error("❌ Failed to fetch user profile:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch user profile")
      );

      // If we have a stored user, keep using it even if the refresh failed
      loadUserFromStorage();
    } finally {
      setIsLoading(false);
      userFetchDebouncer.endFetch();
    }
  };

  // Function to refresh user profile (with debouncing)
  const refreshUser = async () => {
    console.log("🔄 refreshUser() called");
    await fetchUserProfile(false); // Use debouncing
  };

  // Function to fetch user for specific page (with debouncing)
  const fetchUserForPage = async (pageName: string) => {
    console.log(`🔄 fetchUserForPage() called for: ${pageName}`);
    await fetchUserProfile(false); // Use debouncing
  };

  // Function to manually refresh user profile (for explicit use only)
  const manualRefresh = async () => {
    console.log("🔄 manualRefresh() called - FORCE FETCHING");
    await fetchUserProfile(true);
  };

  // Function to clear user profile (for logout)
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    console.log("🧹 User data cleared");
  };

  // Initialize user context on mount ONLY
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log(`🚀 UserContext initializing`);

    // Always try to load from localStorage first
    const hasStoredUser = loadUserFromStorage();

    // If no stored user, try to fetch (with debouncing)
    if (!hasStoredUser) {
      console.log("📦 No stored user found, attempting to fetch");
      fetchUserProfile(false);
    }
  }, []); // Only run once on mount

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        refreshUser,
        clearUser,
        hasValidToken,
        fetchUserForPage,
        manualRefresh,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
