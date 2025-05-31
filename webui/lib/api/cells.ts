// Cells API service
import { getAuthTokens } from "./auth";

// Types
export interface Cell {
  id: string;
  name: string;
  hasLeader: boolean;
  leaderId: string | null;
  sector?: {
    id: string;
    name: string;
  };
  villages?: Village[];
}

export interface Village {
  id: string;
  name: string;
}

export interface CreateCellInput {
  name: string;
  villages?: string[];
}

export interface UpdateCellInput {
  name?: string;
  cellLeaderId?: string;
  villageIds?: string[];
}

export interface AssignCellLeaderInput {
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
 * Get all cells with pagination
 * @param page Page number
 * @param size Items per page
 * @param search Search query
 * @returns Promise with paginated cells
 */
export async function getCells(
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<PaginatedResponse<Cell>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    let url = `/api/v1/cells?page=${page}&size=${size}`;
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
      throw new Error(errorData.message || "Failed to fetch cells");
    }

    const data: ApiResponse<PaginatedResponse<Cell>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get cells error:", error);
    throw error;
  }
}

/**
 * Get all cells for public use (no authentication required)
 * @returns Promise with cells list
 */
export async function getPublicCells(): Promise<Cell[]> {
  try {
    const response = await fetch("/api/v1/cells/public", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch public cells");
    }

    const data: ApiResponse<Cell[]> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get public cells error:", error);
    throw error;
  }
}

/**
 * Search cells by name (public endpoint)
 * @param query Search query
 * @returns Promise with matching cells
 */
export async function searchCells(query: string): Promise<Cell[]> {
  try {
    const response = await fetch(`/api/v1/cells/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to search cells");
    }

    const data: ApiResponse<Cell[]> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Search cells error:", error);
    throw error;
  }
}

/**
 * Get a cell by ID
 * @param id Cell ID
 * @returns Promise with cell data
 */
export async function getCellById(id: string): Promise<Cell> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/cells/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch cell");
    }

    const data: ApiResponse<Cell> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get cell error:", error);
    throw error;
  }
}

/**
 * Create a new cell
 * @param cellData Cell data
 * @returns Promise with created cell
 */
export async function createCell(cellData: CreateCellInput): Promise<Cell> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/cells", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cellData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create cell");
    }

    const data: ApiResponse<Cell> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Create cell error:", error);
    throw error;
  }
}

/**
 * Update a cell
 * @param id Cell ID
 * @param cellData Cell data to update
 * @returns Promise with updated cell
 */
export async function updateCell(
  id: string,
  cellData: UpdateCellInput
): Promise<Cell> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/cells/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cellData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update cell");
    }

    const data: ApiResponse<Cell> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Update cell error:", error);
    throw error;
  }
}

/**
 * Delete a cell
 * @param id Cell ID
 * @returns Promise with success message
 */
export async function deleteCell(id: string): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/cells/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete cell");
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Delete cell error:", error);
    throw error;
  }
}

/**
 * Assign a leader to a cell
 * @param cellId Cell ID
 * @param userId User ID to assign as leader
 * @returns Promise with updated cell
 */
export async function assignCellLeader(
  cellId: string,
  userId: string
): Promise<Cell> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/cells/${cellId}/assign-leader`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to assign cell leader");
    }

    const data: ApiResponse<Cell> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Assign cell leader error:", error);
    throw error;
  }
}

/**
 * Remove a leader from a cell
 * @param cellId Cell ID
 * @returns Promise with updated cell
 */
export async function removeCellLeader(cellId: string): Promise<Cell> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/cells/${cellId}/remove-leader`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to remove cell leader");
    }

    const data: ApiResponse<Cell> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Remove cell leader error:", error);
    throw error;
  }
}
