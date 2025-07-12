import { getAuthTokens } from './auth';
import { User } from './users';

// Types
interface ApiResponse<T> {
  message: string;
  payload: T;
}

interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// House entity type
export interface House {
  id: string;
  code: string;
  address?: string;
  isibo?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  members?: User[];
}

// Input types
export interface CreateHouseInput {
  code: string;
  address?: string;
  isiboId: string;
  memberIds?: string[];
  members?: Array<{
    names: string;
    email: string;
    phone?: string;
  }>;
}

export interface UpdateHouseInput {
  code?: string;
  address?: string;
  memberIds?: string[];
  members?: Array<{
    names: string;
    email: string;
    phone?: string;
  }>;
}

/**
 * Get all houses in an isibo
 * @param isiboId Isibo ID
 * @param page Page number
 * @param size Items per page
 * @param search Search query
 * @returns Promise with paginated houses
 */
export async function getHouses(
  isiboId: string,
  page: number = 1,
  size: number = 10,
  search?: string,
): Promise<PaginatedResponse<House>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    let url = `/api/v1/houses?isiboId=${isiboId}&page=${page}&size=${size}`;
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
          'You do not have permission to view houses in this isibo',
        );
      } else {
        throw new Error(errorData.message || 'Failed to fetch houses');
      }
    }

    const data: ApiResponse<PaginatedResponse<House>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Get houses error:', error);
    throw error;
  }
}

/**
 * Get a house by ID
 * @param id House ID
 * @returns Promise with house data
 */
export async function getHouseById(id: string): Promise<House> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/houses/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to view this house');
      } else if (response.status === 404) {
        throw new Error('House not found');
      } else {
        throw new Error(errorData.message || 'Failed to fetch house');
      }
    }

    const data: ApiResponse<House> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Get house error:', error);
    throw error;
  }
}

/**
 * Create a new house
 * @param houseData House data
 * @returns Promise with created house
 */
export async function createHouse(houseData: CreateHouseInput): Promise<House> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/v1/houses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(houseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to create houses');
      } else {
        throw new Error(errorData.message || 'Failed to create house');
      }
    }

    const data: ApiResponse<House> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Create house error:', error);
    throw error;
  }
}

/**
 * Update a house
 * @param id House ID
 * @param houseData House data to update
 * @returns Promise with updated house
 */
export async function updateHouse(
  id: string,
  houseData: UpdateHouseInput,
): Promise<House> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/houses/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(houseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to update this house');
      } else if (response.status === 404) {
        throw new Error('House not found');
      } else {
        throw new Error(errorData.message || 'Failed to update house');
      }
    }

    const data: ApiResponse<House> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Update house error:', error);
    throw error;
  }
}

/**
 * Delete a house
 * @param id House ID
 * @returns Promise with success message
 */
export async function deleteHouse(id: string): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/houses/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to delete this house');
      } else if (response.status === 404) {
        throw new Error('House not found');
      } else {
        throw new Error(errorData.message || 'Failed to delete house');
      }
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error('Delete house error:', error);
    throw error;
  }
}

/**
 * Add a member to a house
 * @param houseId House ID
 * @param userId User ID to add
 * @returns Promise with success message
 */
export async function addMemberToHouse(houseId: string, userId: string): Promise<void> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/houses/${houseId}/members/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to add members to this house');
      } else if (response.status === 404) {
        throw new Error('House or user not found');
      } else if (response.status === 409) {
        throw new Error('User is already a member of this house');
      } else {
        throw new Error(errorData.message || 'Failed to add member to house');
      }
    }
  } catch (error) {
    console.error('Add member to house error:', error);
    throw error;
  }
}

/**
 * Remove a member from a house
 * @param houseId House ID
 * @param userId User ID to remove
 * @returns Promise with success message
 */
export async function removeMemberFromHouse(houseId: string, userId: string): Promise<void> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/houses/${houseId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to remove members from this house');
      } else if (response.status === 404) {
        throw new Error('House or user not found');
      } else if (response.status === 400) {
        throw new Error('User is not a member of this house');
      } else {
        throw new Error(errorData.message || 'Failed to remove member from house');
      }
    }
  } catch (error) {
    console.error('Remove member from house error:', error);
    throw error;
  }
}
