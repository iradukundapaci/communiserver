"use client";

import { useUser } from "@/lib/contexts/user-context";
import { useEffect, useRef } from "react";

/**
 * A custom hook that loads the user data when the component mounts.
 * It ensures the user data is only loaded once per component instance.
 */
export function useLoadUser() {
  const { refreshUser } = useUser();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load the user data once per component instance
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refreshUser();
    }
  }, [refreshUser]);
}
