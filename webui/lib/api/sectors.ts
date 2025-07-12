// Sectors API service
import { getAuthTokens } from "./auth";

// Types
export interface Sector {
  id: string;
  name: string;
  district?: {
    id: string;
    name: string;
  };
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

interface ApiResponse<T> {
  message: string;
  payload: T;
}

/**
 * Get all sectors
 * @param page Page number
 * @param size Items per page
 * @param search Search query
 * @returns Promise with paginated sectors
 */
export async function getSectors(
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<PaginatedResponse<Sector>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    let url = `/api/v1/sectors?page=${page}&size=${size}`;
    if (search) {
      url += `&q=${encodeURIComponent(search)}`;
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
      throw new Error(errorData.message || "Failed to fetch sectors");
    }

    const data: ApiResponse<PaginatedResponse<Sector>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get sectors error:", error);
    throw error;
  }
}

/**
 * Search sectors by name (public endpoint)
 * @param query Search query
 * @returns Promise with matching sectors
 */
export async function searchSectors(query: string): Promise<Sector[]> {
  try {
    const response = await fetch(`/api/v1/sectors/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to search sectors");
    }

    const data: ApiResponse<Sector[]> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Search sectors error:", error);
    throw error;
  }
}
