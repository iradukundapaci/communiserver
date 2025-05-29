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
}

// Input types
export interface CreateCellLeaderInput {
  names: string;
  email: string;
  phone: string;
  cellId: string;
  villageId: string;
}

export interface CreateVillageLeaderInput {
  names: string;
  email: string;
  phone: string;
  cellId: string;
  villageId: string;
}

export interface CreateIsiboLeaderInput {
  names: string;
  email: string;
  phone: string;
  cellId: string;
  villageId: string;
  isiboId: string;
}

/**
 * Create a new cell leader
 * @param leaderData Cell leader data
 * @returns Promise with success message
 */
export async function createCellLeader(
  leaderData: CreateCellLeaderInput
): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/users/cell-leaders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leaderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error("You do not have permission to create cell leaders");
      } else if (response.status === 409) {
        throw new Error("A user with this email already exists");
      } else {
        throw new Error(errorData.message || "Failed to create cell leader");
      }
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Create cell leader error:", error);
    throw error;
  }
}

/**
 * Create a new village leader
 * @param leaderData Village leader data
 * @returns Promise with success message
 */
export async function createVillageLeader(
  leaderData: CreateVillageLeaderInput
): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/users/village-leaders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leaderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error("You do not have permission to create village leaders");
      } else if (response.status === 409) {
        throw new Error("A user with this email already exists");
      } else {
        throw new Error(errorData.message || "Failed to create village leader");
      }
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Create village leader error:", error);
    throw error;
  }
}

/**
 * Create a new isibo leader
 * @param leaderData Isibo leader data
 * @returns Promise with success message
 */
export async function createIsiboLeader(
  leaderData: CreateIsiboLeaderInput
): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/users/isibo-leaders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leaderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error("You do not have permission to create isibo leaders");
      } else if (response.status === 409) {
        throw new Error("A user with this email already exists");
      } else {
        throw new Error(errorData.message || "Failed to create isibo leader");
      }
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Create isibo leader error:", error);
    throw error;
  }
}

/**
 * Search for users
 * @param query Search query
 * @param role User role filter
 * @param page Page number
 * @param size Items per page
 * @returns Promise with paginated users
 */
export async function searchUsers(
  query: string = "",
  role?: string,
  page: number = 1,
  size: number = 10
): Promise<PaginatedResponse<User>> {
  // Use the getUsers function from the users API service
  const { getUsers } = await import("./users");
  return getUsers({ q: query, role, page, size });
}
