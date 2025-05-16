"use client";

import { getProfile, User } from "@/lib/api/users";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get user from localStorage first
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
      }

      // Always fetch fresh data from the server
      const profile = await getProfile();

      // Update state and localStorage
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch user profile")
      );

      // If we have a stored user, keep using it even if the refresh failed
      if (!user) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh user profile
  const refreshUser = async () => {
    await fetchUserProfile();
  };

  // Function to clear user profile (for logout)
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        refreshUser,
        clearUser,
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
