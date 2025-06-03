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
  activitiesWithReports: number; // Activities that have at least one report
  activitiesWithoutReports: number; // Activities without any reports
  totalTasks: number; // Total tasks across all activities
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
  cancelledTasks: number;
  taskCompletionRate: number;
  activityReportingRate: number; // Percentage of activities with reports
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

// New analytics data structure for updated dashboard
export interface ModernAnalyticsData {
  activities: {
    total: number;
    withReports: number; // Activities that have at least one report
    withoutReports: number; // Activities without any reports
    totalTasks: number; // Total tasks across all activities
  };
  tasks: {
    total: number;
    completed: number;
    ongoing: number;
    pending: number;
    cancelled: number;
  };
  financial: {
    totalEstimatedCost: number;
    totalActualCost: number;
    totalEstimatedImpact: number;
    totalActualImpact: number;
    costVariance: number;
    impactVariance: number;
  };
  participation: {
    totalExpectedParticipants: number;
    totalActualParticipants: number;
    totalYouthParticipants: number;
    participationRate: number;
  };
  reports: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
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

  async getModernAnalytics(query: AnalyticsQuery = {}): Promise<ModernAnalyticsData> {
    const queryString = this.buildQueryString(query);
    return this.request<ModernAnalyticsData>(`/modern-dashboard${queryString}`);
  }

  // Generate sample data for development
  generateSampleModernAnalytics(): ModernAnalyticsData {
    return {
      activities: {
        total: 45,
        withReports: 32,
        withoutReports: 13,
        totalTasks: 128,
      },
      tasks: {
        total: 128,
        completed: 89,
        ongoing: 25,
        pending: 12,
        cancelled: 2,
      },
      financial: {
        totalEstimatedCost: 2500000, // 2.5M RWF
        totalActualCost: 2750000, // 2.75M RWF
        totalEstimatedImpact: 5000000, // 5M RWF
        totalActualImpact: 5200000, // 5.2M RWF
        costVariance: 10, // 10% over budget
        impactVariance: 4, // 4% over expected impact
      },
      participation: {
        totalExpectedParticipants: 1200,
        totalActualParticipants: 1050,
        totalYouthParticipants: 420,
        participationRate: 87.5, // 87.5%
      },
      reports: {
        total: 89,
        thisMonth: 23,
        lastMonth: 18,
      },
    };
  }
}

export const analyticsAPI = new AnalyticsAPI();
