// Tasks API service
import { getAuthTokens } from "./auth";
import { Task, CreateTaskInput, UpdateTaskInput, PaginatedResponse } from "./activities";

interface ApiResponse<T> {
  message: string;
  payload: T;
}

/**
 * Get all tasks with pagination
 * @param activityId Optional activity ID to filter tasks
 * @param page Page number
 * @param size Items per page
 * @returns Promise with paginated tasks
 */
export async function getTasks(
  activityId?: string,
  page: number = 1,
  size: number = 10
): Promise<PaginatedResponse<Task>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    let url = `/api/v1/tasks?page=${page}&size=${size}`;
    if (activityId) {
      url += `&activityId=${activityId}`;
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
      throw new Error(errorData.message || "Failed to fetch tasks");
    }

    const data: ApiResponse<PaginatedResponse<Task>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get tasks error:", error);
    throw error;
  }
}

/**
 * Get a task by ID
 * @param id Task ID
 * @returns Promise with task data
 */
export async function getTaskById(id: string): Promise<Task> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/tasks/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch task");
    }

    const data: ApiResponse<Task> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get task error:", error);
    throw error;
  }
}

/**
 * Create a new task
 * @param taskData Task data
 * @returns Promise with created task
 */
export async function createTask(taskData: CreateTaskInput): Promise<Task> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create task");
    }

    const data: ApiResponse<Task> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Create task error:", error);
    throw error;
  }
}

/**
 * Update a task
 * @param id Task ID
 * @param taskData Task data to update
 * @returns Promise with updated task
 */
export async function updateTask(
  id: string,
  taskData: UpdateTaskInput
): Promise<Task> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/tasks/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update task");
    }

    const data: ApiResponse<Task> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Update task error:", error);
    throw error;
  }
}

/**
 * Delete a task
 * @param id Task ID
 * @returns Promise with success message
 */
export async function deleteTask(id: string): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete task");
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Delete task error:", error);
    throw error;
  }
}
