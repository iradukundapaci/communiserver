import { getAuthTokens } from "./auth";

// Types
interface ApiResponse<T> {
  message: string;
  payload: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface User {
  id: string;
  names: string;
  email: string;
  phone: string;
  role: string;
  activated: boolean;
  cell?: {
    id: string;
    name: string;
  };
  village?: {
    id: string;
    name: string;
  };
  isibo?: {
    id: string;
    name: string;
  };
  isIsiboLeader?: boolean;
  isVillageLeader?: boolean;
  isCellLeader?: boolean;
}

/**
 * Get all users with optional filtering
 * @param query Search query for name, email, or phone
 * @param role Filter by user role
 * @param page Page number
 * @param size Items per page
 * @returns Promise with paginated users
 */
export async function getUsers(
  query?: string,
  role?: string,
  page: number = 1,
  size: number = 10
): Promise<PaginatedResponse<User>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    let url = `/api/v1/users?page=${page}&size=${size}`;
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }
    if (role) {
      url += `&role=${encodeURIComponent(role)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error("You do not have permission to view users");
      } else {
        throw new Error(errorData.message || "Failed to fetch users");
      }
    }

    const data: ApiResponse<PaginatedResponse<User>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get users error:", error);
    throw error;
  }
}

/**
 * Get user profile
 * @returns Promise with user profile
 */
export async function getProfile(): Promise<User> {
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

    const data: ApiResponse<User> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}

/**
 * Update user profile
 * @param profileData Profile data to update
 * @returns Promise with updated user profile
 */
export async function updateProfile(profileData: {
  names?: string;
  email?: string;
  phone?: string;
}): Promise<User> {
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

    const data: ApiResponse<User> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}
