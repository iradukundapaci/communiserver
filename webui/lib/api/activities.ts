// Activities API service
import { getAuthTokens } from "./auth";

// Types - ActivityStatus removed as activities no longer have status field

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: Date;
  village?: {
    id: string;
    name: string;
    cell?: {
      id: string;
      name: string;
      sector?: {
        id: string;
        name: string;
        district?: {
          id: string;
          name: string;
          province?: {
            id: string;
            name: string;
          };
        };
      };
    };
  };
  tasks?: Task[];
}

export enum TaskStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  ONGOING = "ongoing",
  UPCOMING = "upcoming",
  RESCHEDULED = "rescheduled",
  POSTPONED = "postponed",
  PENDING = "pending",
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  estimatedCost: number;
  actualCost: number;
  expectedParticipants: number;
  actualParticipants: number;
  expectedFinancialImpact: number;
  actualFinancialImpact: number;
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
  villageId?: string;
  tasks?: UpdateTaskInput[];
}

export interface CreateTaskInput {
  title: string;
  description: string;
  activityId: string;
  isiboId: string;
  estimatedCost?: number;
  expectedParticipants?: number;
  expectedFinancialImpact?: number;
}

export interface UpdateTaskInput {
  id?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  isiboId?: string;
  estimatedCost?: number;
  actualCost?: number;
  expectedParticipants?: number;
  actualParticipants?: number;
  expectedFinancialImpact?: number;
  actualFinancialImpact?: number;
}

// Filtering interfaces
export interface ActivityFilters {
  q?: string; // Search query
  villageId?: string;
  cellId?: string;
  page?: number;
  size?: number;
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
 * Get all activities with pagination and filtering
 * @param filters Activity filters
 * @returns Promise with paginated activities
 */
export async function getActivities(
  filters: ActivityFilters = {}
): Promise<PaginatedResponse<Activity>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const { page = 1, size = 10, q, villageId, cellId } = filters;

    let url = `/api/v1/activities?page=${page}&size=${size}`;
    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    }
    if (villageId) {
      url += `&villageId=${encodeURIComponent(villageId)}`;
    }
    if (cellId) {
      url += `&cellId=${encodeURIComponent(cellId)}`;
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
 * Get public activities (no authentication required)
 * @param filters Activity filters
 * @returns Promise with paginated activities
 */
export async function getPublicActivities(
  filters: ActivityFilters = {}
): Promise<PaginatedResponse<Activity>> {
  try {
    const { page = 1, size = 20, q, villageId, cellId } = filters;

    let url = `/api/v1/activities/public?page=${page}&size=${size}`;
    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    }
    if (villageId) {
      url += `&villageId=${encodeURIComponent(villageId)}`;
    }
    if (cellId) {
      url += `&cellId=${encodeURIComponent(cellId)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch public activities");
    }

    const data: ApiResponse<PaginatedResponse<Activity>> =
      await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get public activities error:", error);
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

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  try {
    const tokens = getTokens();
    if (!tokens) {
      throw new Error("No authentication tokens found");
    }

    const response = await fetch(`${API_BASE_URL}/activities/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update task");
    }

    const data: ApiResponse<Task> = await response.json();
    return data.data;
  } catch (error) {
    console.error("Update task error:", error);
    throw error;
  }
}
