import { getAuthTokens } from './auth';

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
  userId?: string; // User ID for deletion purposes (when available from house members)
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
  house?: {
    id: string;
    code: string;
    address?: string;
  };
  isIsiboLeader?: boolean;
  isVillageLeader?: boolean;
  isCellLeader?: boolean;
}

export interface CreateCitizenInput {
  names: string;
  email: string;
  phone: string;
  cellId: string;
  villageId: string;
  isiboId?: string;
}

/**
 * Get all users with optional filtering
 * @param params Object with query parameters
 * @returns Promise with paginated users
 */
export async function getUsers(
  params: {
    q?: string;
    role?: string;
    page?: number;
    size?: number;
  } = {},
): Promise<PaginatedResponse<User>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const { q, role, page = 1, size = 10 } = params;
    let url = `/api/v1/users?page=${page}&size=${size}`;
    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    }
    if (role) {
      url += `&role=${encodeURIComponent(role)}`;
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
        throw new Error('You do not have permission to view users');
      } else {
        throw new Error(errorData.message || 'Failed to fetch users');
      }
    }

    const data: ApiResponse<PaginatedResponse<User>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Get users error:', error);
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
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/v1/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile');
    }

    const data: ApiResponse<User> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Get profile error:', error);
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
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/v1/users', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data: ApiResponse<User> = await response.json();
    return data.payload;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

/**
 * Create a new citizen
 * @param citizenData Citizen data
 * @returns Promise with success message
 */
export async function createCitizen(
  citizenData: CreateCitizenInput,
): Promise<void> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/v1/users/citizens', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(citizenData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create citizen');
    }
  } catch (error) {
    console.error('Create citizen error:', error);
    throw error;
  }
}

/**
 * Delete a user
 * @param id User ID
 * @returns Promise with success message
 */
export async function deleteUser(id: string): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/v1/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error('You do not have permission to delete this user');
      } else if (response.status === 404) {
        throw new Error('User not found');
      } else {
        throw new Error(errorData.message || 'Failed to delete user');
      }
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
}
