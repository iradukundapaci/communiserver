// Analytics API service

// Types for analytics data
export interface UserRoleStats {
  role: string;
  count: number;
  percentage: number;
}

export interface LocationStats {
  totalVillages: number;
  villagesWithLeaders: number;
  villagesWithoutLeaders: number;
  leadershipCoveragePercentage: number;
  totalIsibos: number;
  isibosWithLeaders: number;
  isibosWithoutLeaders: number;
  isiboLeadershipPercentage: number;
  totalCells: number;
}

export interface ActivityStats {
  totalActivities: number;
  activeActivities: number;
  completedActivities: number;
  pendingActivities: number;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
  taskCompletionRate: number;
}

export interface ReportStats {
  totalReports: number;
  reportsWithEvidence: number;
  reportsWithoutEvidence: number;
  evidencePercentage: number;
  averageAttendance: number;
  totalAttendees: number;
}

export interface CoreMetrics {
  userStats: UserRoleStats[];
  locationStats: LocationStats;
  activityStats: ActivityStats;
  reportStats: ReportStats;
}

export interface TimeSeriesData {
  date: string;
  activities: number;
  tasks: number;
  reports: number;
  completedTasks: number;
}

export interface LocationPerformance {
  locationId: string;
  locationName: string;
  locationType: 'village' | 'cell' | 'isibo';
  totalActivities: number;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  totalReports: number;
}

export interface EngagementMetrics {
  averageCitizensPerIsibo: number;
  mostActiveVillages: LocationPerformance[];
  reportSubmissionFrequency: number;
  totalCitizens: number;
}

export interface DashboardSummary {
  coreMetrics: CoreMetrics;
  timeSeriesData: TimeSeriesData[];
  locationPerformance: LocationPerformance[];
  engagementMetrics: EngagementMetrics;
  generatedAt: string;
  timeRange: string;
}

export interface AnalyticsQuery {
  timeRange?: '7d' | '30d' | '90d' | '1y';
  startDate?: string;
  endDate?: string;
  locationId?: string;
}

class AnalyticsAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`/api/v1/analytics${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    return response.json();
  }

  private buildQueryString(params: AnalyticsQuery): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getCoreMetrics(query: AnalyticsQuery = {}): Promise<CoreMetrics> {
    const queryString = this.buildQueryString(query);
    return this.request<CoreMetrics>(`/core-metrics${queryString}`);
  }

  async getTimeSeriesData(query: AnalyticsQuery = {}): Promise<TimeSeriesData[]> {
    const queryString = this.buildQueryString(query);
    return this.request<TimeSeriesData[]>(`/time-series${queryString}`);
  }

  async getLocationPerformance(query: AnalyticsQuery = {}): Promise<LocationPerformance[]> {
    const queryString = this.buildQueryString(query);
    return this.request<LocationPerformance[]>(`/location-performance${queryString}`);
  }

  async getEngagementMetrics(query: AnalyticsQuery = {}): Promise<EngagementMetrics> {
    const queryString = this.buildQueryString(query);
    return this.request<EngagementMetrics>(`/engagement-metrics${queryString}`);
  }

  async getDashboardSummary(query: AnalyticsQuery = {}): Promise<DashboardSummary> {
    const queryString = this.buildQueryString(query);
    return this.request<DashboardSummary>(`/dashboard-summary${queryString}`);
  }
}

export const analyticsAPI = new AnalyticsAPI();
