// Activities API service
import { getAuthTokens } from "./auth";

// Types
export enum ActivityStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: Date;
  status: ActivityStatus;
  village?: {
    id: string;
    name: string;
  };
  tasks?: Task[];
}

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  activity: {
    id: string;
    title: string;
  };
  isibo?: {
    id: string;
    names: string;
  };
}

export interface CreateActivityInput {
  title: string;
  description: string;
  date: string;
  villageId: string;
  tasks?: CreateTaskInput[];
}

export interface UpdateActivityInput {
  title?: string;
  description?: string;
  date?: string;
  status?: ActivityStatus;
  villageId?: string;
  tasks?: UpdateTaskInput[];
}

export interface CreateTaskInput {
  title: string;
  description: string;
  activityId: string;
  isiboId: string;
}

export interface UpdateTaskInput {
  id?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  isiboId?: string;
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
 * Get all activities with pagination
 * @param page Page number
 * @param size Items per page
 * @param search Search query
 * @returns Promise with paginated activities
 */
export async function getActivities(
  page: number = 1,
  size: number = 10,
  search?: string
): Promise<PaginatedResponse<Activity>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    let url = `/api/v1/activities?page=${page}&size=${size}`;
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
      throw new Error(errorData.message || "Failed to fetch activities");
    }

    const data: ApiResponse<PaginatedResponse<Activity>> =
      await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get activities error:", error);
    throw error;
  }
}

/**
 * Get an activity by ID
 * @param id Activity ID
 * @returns Promise with activity data
 */
export async function getActivityById(id: string): Promise<Activity> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/activities/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch activity");
    }

    const data: ApiResponse<Activity> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get activity error:", error);
    throw error;
  }
}

/**
 * Create a new activity
 * @param activityData Activity data
 * @returns Promise with created activity
 */
export async function createActivity(
  activityData: CreateActivityInput
): Promise<Activity> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/activities", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create activity");
    }

    const data: ApiResponse<Activity> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Create activity error:", error);
    throw error;
  }
}

/**
 * Update an activity
 * @param id Activity ID
 * @param activityData Activity data to update
 * @returns Promise with updated activity
 */
export async function updateActivity(
  id: string,
  activityData: UpdateActivityInput
): Promise<Activity> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/activities/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update activity");
    }

    const data: ApiResponse<Activity> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Update activity error:", error);
    throw error;
  }
}

/**
 * Delete an activity
 * @param id Activity ID
 * @returns Promise with success message
 */
export async function deleteActivity(id: string): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/activities/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete activity");
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Delete activity error:", error);
    throw error;
  }
}
