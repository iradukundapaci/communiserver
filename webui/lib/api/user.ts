// User API service
import { getAuthTokens } from "./auth";

// Types
export interface UserProfile {
  id: string;
  names: string;
  email: string;
  activated: boolean;
  role: string;
  phone: string;
  cell: string;
  village: string;
  isVillageLeader: boolean;
  isCellLeader: boolean;
}

export interface UpdateProfileInput {
  names?: string;
  email?: string;
  phone?: string;
  isiboId?: string;
}

interface ApiResponse<T> {
  message: string;
  payload: T;
}

/**
 * Get the current user's profile
 * @returns Promise with user profile data
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch profile");
    }

    const data: ApiResponse<UserProfile> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}

/**
 * Update the current user's profile
 * @param profileData Profile data to update
 * @returns Promise with updated user profile
 */
export async function updateUserProfile(
  profileData: UpdateProfileInput
): Promise<UserProfile> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/users", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    const data: ApiResponse<UserProfile> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}

/**
 * Change the user's password
 * @param newPassword New password
 * @returns Promise with success message
 */
export async function changePassword(newPassword: string): Promise<string> {
  try {
    const tokens = getAuthTokens();
    const userId = "me"; // Use 'me' to refer to the current user

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/users/${userId}/change-password`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to change password");
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
}
