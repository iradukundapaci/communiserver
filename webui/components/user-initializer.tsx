"use client";

import { useUser } from "@/lib/contexts/user-context";
import { useEffect } from "react";

/**
 * A component that initializes the user data by calling the users/me API
 * This component doesn't render anything visible, it just triggers the API call
 * when it mounts, but only once per session.
 */
export function UserInitializer() {
  // Use a static variable to track initialization across all instances
  // This ensures we only initialize once, even if the component is mounted multiple times
  if (
    typeof window !== "undefined" &&
    !window.hasOwnProperty("__userInitialized")
  ) {
    window.__userInitialized = false;
  }

  const { refreshUser } = useUser();

  useEffect(() => {
    // Only run once per session
    if (typeof window !== "undefined" && !window.__userInitialized) {
      window.__userInitialized = true;

      // Add a small delay to avoid any race conditions
      const timer = setTimeout(() => {
        refreshUser();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [refreshUser]);

  // This component doesn't render anything
  return null;
}

// Add the missing property to the Window interface
declare global {
  interface Window {
    __userInitialized: boolean;
  }
}
