// Locations API service
import { getAuthTokens } from './auth';

// Types
export interface Location {
  id: string;
  name: string;
  code?: string;
}

export interface Isibo {
  id: string;
  name: string;
  hasLeader?: boolean;
  leaderId?: string | null;
  village?: {
    id: string;
    name: string;
  };
}

export interface House {
  id: string;
  code: string;
  address?: string;
  isibo?: {
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
 * Get all isibos in a village
 * @param villageId Village ID
 * @param page Page number
 * @param size Items per page
 * @param search Search query
 * @returns Promise with paginated isibos
 */
export async function getIsibos(
  villageId: string,
  page: number = 1,
  size: number = 100,
): Promise<PaginatedResponse<Isibo>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const url = `/api/v1/isibos?villageId=${villageId}&page=${page}&size=${size}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch isibos');
    }

    const data: ApiResponse<PaginatedResponse<Location>> =
      await response.json();
    return data.payload;
  } catch (error) {
    console.error('Get isibos error:', error);
    throw error;
  }
}

/**
 * Get all houses in an isibo
 * @param isiboId Isibo ID
 * @param page Page number
 * @param size Items per page
 * @returns Promise with paginated houses
 */
export async function getHouses(
  isiboId: string,
  page: number = 1,
  size: number = 100,
): Promise<PaginatedResponse<House>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const url = `/api/v1/houses?isiboId=${isiboId}&page=${page}&size=${size}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch houses');
    }

    const data: ApiResponse<PaginatedResponse<House>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Get houses error:', error);
    throw error;
  }
}
