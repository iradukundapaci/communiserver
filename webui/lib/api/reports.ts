// Reports API service
import { getAuthTokens } from "./auth";

// Types
export interface Report {
  id: string;
  activity: {
    id: string;
    title: string;
  };
  task: {
    id: string;
    title: string;
  };
  attendance?: Citizen[];
  comment?: string;
  evidenceUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Citizen {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber?: string;
}

export interface CreateReportInput {
  activityId: string;
  taskId: string;
  attendance?: Citizen[];
  comment?: string;
  evidenceUrls?: string[];
}

export interface UpdateReportInput {
  activityId?: string;
  taskId?: string;
  attendance?: Citizen[];
  comment?: string;
  evidenceUrls?: string[];
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
 * Get all reports with pagination
 * @param page Page number
 * @param size Items per page
 * @param activityId Optional activity ID to filter reports
 * @param taskId Optional task ID to filter reports
 * @param isiboId Optional isibo ID to filter reports
 * @returns Promise with paginated reports
 */
export async function getReports(
  page: number = 1,
  size: number = 10,
  activityId?: string,
  taskId?: string,
  isiboId?: string
): Promise<PaginatedResponse<Report>> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    let url = `/api/v1/reports?page=${page}&size=${size}`;
    if (activityId) {
      url += `&activityId=${encodeURIComponent(activityId)}`;
    }
    if (taskId) {
      url += `&taskId=${encodeURIComponent(taskId)}`;
    }
    if (isiboId) {
      url += `&isiboId=${encodeURIComponent(isiboId)}`;
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
      throw new Error(errorData.message || "Failed to fetch reports");
    }

    const data: ApiResponse<PaginatedResponse<Report>> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get reports error:", error);
    throw error;
  }
}

/**
 * Get a report by ID
 * @param id Report ID
 * @returns Promise with report data
 */
export async function getReportById(id: string): Promise<Report> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/reports/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch report");
    }

    const data: ApiResponse<Report> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Get report error:", error);
    throw error;
  }
}

/**
 * Create a new report
 * @param reportData Report data
 * @returns Promise with created report
 */
export async function createReport(
  reportData: CreateReportInput
): Promise<Report> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/reports", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create report");
    }

    const data: ApiResponse<Report> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Create report error:", error);
    throw error;
  }
}

/**
 * Update a report
 * @param id Report ID
 * @param reportData Report data to update
 * @returns Promise with updated report
 */
export async function updateReport(
  id: string,
  reportData: UpdateReportInput
): Promise<Report> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/reports/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update report");
    }

    const data: ApiResponse<Report> = await response.json();
    return data.payload;
  } catch (error) {
    console.error("Update report error:", error);
    throw error;
  }
}

/**
 * Delete a report
 * @param id Report ID
 * @returns Promise with success message
 */
export async function deleteReport(id: string): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`/api/v1/reports/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete report");
    }

    const data: ApiResponse<null> = await response.json();
    return data.message;
  } catch (error) {
    console.error("Delete report error:", error);
    throw error;
  }
}
