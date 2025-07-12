// Isibos API service
import { getAuthTokens } from './auth';

// Types
export interface IsiboMember {
  id: string;
  names: string;
  user: {
    id: string;
    email: string;
    phone: string;
    role: string;
  };
}

export interface Isibo {
  id: string;
  name: string;
  hasLeader: boolean;
  leaderId: string | null;
  village?: {
    id: string;
    name: string;
  };
  houses?: House[];
  members?: IsiboMember[];
}

export interface House {
  id: string;
  code: string;
}

export interface Citizen {
  names: string;
  email: string;
  phone: string;
}

export interface CreateIsiboInput {
  name: string;
  villageId: string;
  isiboLeaderId?: string;
  members?: Citizen[];
}

export interface UpdateIsiboInput {
  name?: string;
  villageId?: string;
  isiboLeaderId?: string;
  memberIds?: string[];
  newMembers?: Citizen[];
}

export interface AssignIsiboLeaderInput {
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
 * Get all isibos with pagination
 * @param villageId Village ID (optional - if not provided, searches all isibos)
 * @param page Page number
 * @param size Items per page
 * @param search Search query
 * @returns Promise with paginated isibos
 */
export async function getIsibos(
  villageId?: string,
  page: number = 1,
  size: number = 10,
  search?: string,
): Promise<PaginatedResponse<Isibo>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    let url = `/api/v1/isibos?page=${page}&size=${size}`;
    if (villageId && villageId !== "all") {
      url += `&villageId=${villageId}`;
    }
    if (search) {
      url += `&q=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error(
          'You do not have permission to view isibos in this village',
        );
      } else {
        throw new Error(errorData.message || 'Failed to fetch isibos');
      }
    }

    const data: ApiResponse<PaginatedResponse<Isibo>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Get isibos error:', error);
    throw error;
  }
}

/**
 * Search isibos across all villages
 * @param query Search query
 * @param size Maximum number of results
 * @returns Promise with array of isibos
 */
export async function searchIsibos(
  query: string,
  size: number = 20,
): Promise<Isibo[]> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    let url = `/api/v1/isibos/search?page=1&size=${size}`;
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data: ApiResponse<PaginatedResponse<Isibo>> = await response.json();

    // Add defensive checks to ensure we return an array
    if (!data || !data.payload || !Array.isArray(data.payload.items)) {
      console.warn('Invalid response structure from isibos search:', data);
      return [];
    }

    return data.payload.items;
  } catch (error) {
    console.error('Search isibos error:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}

/**
 * Get an isibo by ID
 * @param id Isibo ID
 * @returns Promise with isibo data
 */
export async function getIsiboById(id: string): Promise<Isibo> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/isibos/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to view this isibo');
      } else if (response.status === 404) {
        throw new Error('Isibo not found');
      } else {
        throw new Error(errorData.message || 'Failed to fetch isibo');
      }
    }

    const data: ApiResponse<Isibo> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Get isibo error:', error);
    throw error;
  }
}

/**
 * Create a new isibo
 * @param isiboData Isibo data
 * @returns Promise with created isibo
 */
export async function createIsibo(isiboData: CreateIsiboInput): Promise<Isibo> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/v1/isibos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(isiboData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create isibo');
    }

    const data: ApiResponse<Isibo> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Create isibo error:', error);
    throw error;
  }
}

/**
 * Update an isibo
 * @param id Isibo ID
 * @param isiboData Isibo data to update
 * @returns Promise with updated isibo
 */
export async function updateIsibo(
  id: string,
  isiboData: UpdateIsiboInput,
): Promise<Isibo> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/isibos/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(isiboData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to update this isibo');
      } else if (response.status === 404) {
        throw new Error('Isibo not found');
      } else {
        throw new Error(errorData.message || 'Failed to update isibo');
      }
    }

    const data: ApiResponse<Isibo> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Update isibo error:', error);
    throw error;
  }
}

/**
 * Delete an isibo
 * @param id Isibo ID
 * @returns Promise with success message
 */
export async function deleteIsibo(id: string): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/isibos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete isibo');
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error('Delete isibo error:', error);
    throw error;
  }
}

/**
 * Assign a leader to an isibo
 * @param isiboId Isibo ID
 * @param userId User ID to assign as leader
 * @returns Promise with updated isibo
 */
export async function assignIsiboLeader(
  isiboId: string,
  userId: string,
): Promise<Isibo> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/isibos/${isiboId}/assign-leader`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to assign isibo leader');
    }

    const data: ApiResponse<Isibo> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Assign isibo leader error:', error);
    throw error;
  }
}

/**
 * Remove a leader from an isibo
 * @param isiboId Isibo ID
 * @returns Promise with updated isibo
 */
export async function removeIsiboLeader(isiboId: string): Promise<Isibo> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/isibos/${isiboId}/remove-leader`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove isibo leader');
    }

    const data: ApiResponse<Isibo> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Remove isibo leader error:', error);
    throw error;
  }
}
