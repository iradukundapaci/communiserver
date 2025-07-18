// Reports API service
import { getAuthTokens } from "./auth";

// Types
export interface Report {
  id: string;
  activity: {
    id: string;
    title: string;
    description: string;
    date: string;
    village: {
      id: string;
      name: string;
    };
  };
  task: {
    id: string;
    title: string;
    description: string;
    status: string;
    estimatedCost: number;
    actualCost: number;
    expectedParticipants: number;
    actualParticipants: number;
    expectedFinancialImpact: number;
    actualFinancialImpact: number;
    isibo: {
      id: string;
      name: string;
    };
  };
  attendance?: ReportAttendee[];
  comment?: string;
  materialsUsed?: string[];
  challengesFaced?: string;
  suggestions?: string;
  evidenceUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportAttendee {
  id: string;
  names: string;
  email: string;
  phone: string;
  role: string;
}

export interface CreateReportInput {
  activityId: string;
  taskId: string;
  attendanceIds?: string[];
  // Task financial data (copied from task)
  estimatedCost?: number;
  actualCost?: number;
  expectedParticipants?: number;
  actualParticipants?: number;
  expectedFinancialImpact?: number;
  actualFinancialImpact?: number;
  comment?: string;
  materialsUsed?: string[];
  challengesFaced?: string;
  suggestions?: string;
  evidenceUrls?: string[];
}

export interface UpdateReportInput {
  activityId?: string;
  taskId?: string;
  attendanceIds?: string[];
  // Task financial data (copied from task)
  estimatedCost?: number;
  actualCost?: number;
  expectedParticipants?: number;
  actualParticipants?: number;
  expectedFinancialImpact?: number;
  actualFinancialImpact?: number;
  comment?: string;
  materialsUsed?: string[];
  challengesFaced?: string;
  suggestions?: string;
  evidenceUrls?: string[];
}

export interface GenerateReportSummaryInput {
  title: string;
  subtitle?: string;
  includeStats?: boolean;
  includeReportDetails?: boolean;
  // Filter parameters (same as report filters)
  activityId?: string;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  hasEvidence?: boolean;
  minCost?: number;
  maxCost?: number;
  minParticipants?: number;
  maxParticipants?: number;
  isiboId?: string;
}

export interface EmailReportSummaryInput extends GenerateReportSummaryInput {
  recipientEmail: string;
  message?: string;
}

export interface ReportSummaryStats {
  totalReports: number;
  totalActivities: number;
  totalIsibos: number;
  totalCost: number;
  totalParticipants: number;
  averageAttendance: number;
  reportsWithEvidence: number;
  reportsWithChallenges: number;
  reportsWithSuggestions: number;
}

export interface EmailReportSummaryResponse {
  success: boolean;
  message: string;
  emailSent: boolean;
  reportGenerated: boolean;
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

/**
 * Check if a task has an existing report
 * @param taskId Task ID to check
 * @returns Promise with the report if it exists, null otherwise
 */
export async function getTaskReport(taskId: string): Promise<Report | null> {
  try {
    const response = await getReports(1, 1, undefined, taskId);
    return response.items.length > 0 ? response.items[0] : null;
  } catch (error) {
    console.error("Get task report error:", error);
    return null;
  }
}

/**
 * Generate a PDF summary report
 * @param input Report summary generation parameters
 * @returns Promise with PDF blob
 */
export async function generateReportSummary(input: GenerateReportSummaryInput): Promise<Blob> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/reports/summary/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate report summary");
    }

    return await response.blob();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate report summary");
  }
}

/**
 * Generate and email a PDF summary report
 * @param input Email report summary parameters
 * @returns Promise with email response
 */
export async function emailReportSummary(input: EmailReportSummaryInput): Promise<EmailReportSummaryResponse> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch("/api/v1/reports/summary/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to email report summary");
    }

    const data = await response.json();
    return data.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to email report summary");
  }
}
