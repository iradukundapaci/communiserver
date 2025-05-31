"use client";

import { useUser } from "@/lib/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LocationsRedirect() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Determine the appropriate tab based on user role
    let redirectPath = "/dashboard/locations/";

    switch (user.role) {
      case "ADMIN":
        redirectPath += "cells";
        break;
      case "CELL_LEADER":
        redirectPath += "villages";
        break;
      case "VILLAGE_LEADER":
        redirectPath += "isibos";
        break;
      case "ISIBO_LEADER":
        redirectPath = "/dashboard/isibo/edit";
        break;
      default:
        // If no appropriate tab, redirect to dashboard
        redirectPath = "/dashboard";
    }

    // Use replace instead of push to avoid adding to history
    router.replace(redirectPath);
  }, [user?.id, user?.role, router]); // Only depend on specific user properties

  // Show a loading indicator while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
