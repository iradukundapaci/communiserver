"use client";

import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/lib/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user: authUser, isLoading: authLoading, checkAuth } = useAuth();
  const { user: contextUser } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const verifyAuthAndLoadUser = async () => {
      // Only run once
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      try {
        const isAuthenticated = await checkAuth();

        if (!isAuthenticated) {
          toast.error("Please log in to access this page");
          router.push("/");
          return;
        }

        // Note: No automatic user fetching to prevent infinite loops
        // User context will load from localStorage automatically
        console.log("✅ Authentication verified, using stored user data");
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuthAndLoadUser();
  }, []); // No dependencies - run only once

  // Show loading state while checking authentication
  if (authLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, render children
  return authUser ? <>{children}</> : null;
}
