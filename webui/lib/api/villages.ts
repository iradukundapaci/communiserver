// Villages API service
import { getAuthTokens } from "./auth";

// Types
export interface Village {
  id: string;
  name: string;
  hasLeader: boolean;
  leaderId: string | null;
  cell?: {
    id: string;
    name: string;
  };
  isibos?: Isibo[];
}

export interface Isibo {
  id: string;
  name: string;
}

export interface CreateVillageInput {
  name: string;
  cellId: string;
  villageLeaderId?: string;
}

export interface UpdateVillageInput {
  name?: string;
  cellId?: string;
  villageLeaderId?: string;
}

export interface AssignVillageLeaderInput {
  userId: string;
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
 * Get all villages with pagination
 * @param cellId Cell ID
 * @param page Page number
 * @param size Items per page
 * @param search Search query
 * @returns Promise with paginated villages
 */
export async function getVillages(
  cellId: string,
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<PaginatedResponse<Village>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    let url = `/api/v1/villages?cellId=${cellId}&page=${page}&size=${size}`;
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
      throw new Error(errorData.message || "Failed to fetch villages");
    }

    const data: ApiResponse<PaginatedResponse<Village>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get villages error:", error);
    throw error;
  }
}

/**
 * Get a village by ID
 * @param id Village ID
 * @returns Promise with village data
 */
export async function getVillageById(id: string): Promise<Village> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/villages/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch village");
    }

    const data: ApiResponse<Village> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get village error:", error);
    throw error;
  }
}

/**
 * Create a new village
 * @param villageData Village data
 * @returns Promise with created village
 */
export async function createVillage(
  villageData: CreateVillageInput
): Promise<Village> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/villages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(villageData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create village");
    }

    const data: ApiResponse<Village> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Create village error:", error);
    throw error;
  }
}

/**
 * Update a village
 * @param id Village ID
 * @param villageData Village data to update
 * @returns Promise with updated village
 */
export async function updateVillage(
  id: string,
  villageData: UpdateVillageInput
): Promise<Village> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/villages/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(villageData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update village");
    }

    const data: ApiResponse<Village> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Update village error:", error);
    throw error;
  }
}

/**
 * Delete a village
 * @param id Village ID
 * @returns Promise with success message
 */
export async function deleteVillage(id: string): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/villages/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete village");
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Delete village error:", error);
    throw error;
  }
}

/**
 * Assign a leader to a village
 * @param villageId Village ID
 * @param userId User ID to assign as leader
 * @returns Promise with updated village
 */
export async function assignVillageLeader(
  villageId: string,
  userId: string
): Promise<Village> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `/api/v1/villages/${villageId}/assign-leader`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to assign village leader");
    }

    const data: ApiResponse<Village> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Assign village leader error:", error);
    throw error;
  }
}

/**
 * Remove a leader from a village
 * @param villageId Village ID
 * @returns Promise with updated village
 */
export async function removeVillageLeader(villageId: string): Promise<Village> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `/api/v1/villages/${villageId}/remove-leader`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to remove village leader");
    }

    const data: ApiResponse<Village> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Remove village leader error:", error);
    throw error;
  }
}
