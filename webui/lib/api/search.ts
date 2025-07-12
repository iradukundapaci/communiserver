import { getAuthTokens } from './auth';

export interface SearchParams {
  q?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
  tags?: string[];
  [key: string]: any;
}

export interface ActivitySearchParams extends SearchParams {
  cellId?: string;
  villageId?: string;
  villageIds?: string[];
  organizerId?: string;
  organizerIds?: string[];
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  activityType?: string;
}

export interface TaskSearchParams extends SearchParams {
  activityId?: string;
  activityIds?: string[];
  status?: string;
  statuses?: string[];
  isiboId?: string;
  isiboIds?: string[];
  minEstimatedCost?: number;
  maxEstimatedCost?: number;
  minExpectedParticipants?: number;
  maxExpectedParticipants?: number;
  createdFrom?: string;
  createdTo?: string;
  villageName?: string;
  cellName?: string;
}

export interface ReportSearchParams extends SearchParams {
  activityId?: string;
  activityIds?: string[];
  taskId?: string;
  taskIds?: string[];
  isiboId?: string;
  isiboIds?: string[];
  minActualCost?: number;
  maxActualCost?: number;
  minActualParticipants?: number;
  maxActualParticipants?: number;
  createdFrom?: string;
  createdTo?: string;
  hasEvidence?: boolean;
  villageName?: string;
  cellName?: string;
  materialsUsed?: string[];
}

export interface UserSearchParams extends SearchParams {
  role?: string;
  roles?: string[];
  villageIds?: string[];
  cellIds?: string[];
  houseIds?: string[];
  createdFrom?: string;
  createdTo?: string;
  isActive?: boolean;
  villageName?: string;
  cellName?: string;
}

export interface LocationSearchParams extends SearchParams {
  type?: string;
  types?: string[];
  parentId?: string;
  parentIds?: string[];
  provinceId?: string;
  districtId?: string;
  sectorId?: string;
  cellId?: string;
  villageId?: string;
  provinceName?: string;
  districtName?: string;
  sectorName?: string;
  cellName?: string;
  villageName?: string;
  minPopulation?: number;
  maxPopulation?: number;
  createdFrom?: string;
  createdTo?: string;
  leaderIds?: string[];
}

export interface GlobalSearchParams extends SearchParams {
  entities?: string[];
  locationIds?: string[];
  userIds?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'activity' | 'task' | 'report' | 'user' | 'location';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  relevanceScore?: number;
}

export interface SearchResponse<T = SearchResult> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface GlobalSearchResponse {
  results: {
    activities: SearchResult[];
    tasks: SearchResult[];
    reports: SearchResult[];
    users: SearchResult[];
    locations: SearchResult[];
  };
  totalResults: number;
  meta: {
    query: string;
    searchTime: number;
    entitiesSearched: string[];
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

class SearchAPI {
  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const tokens = getAuthTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const url = `${endpoint}?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Search API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.payload || data;
  }

  async searchActivities(params: ActivitySearchParams): Promise<SearchResponse> {
    return this.request('/api/v1/activities', params);
  }

  async searchTasks(params: TaskSearchParams): Promise<SearchResponse> {
    return this.request('/api/v1/tasks', params);
  }

  async searchReports(params: ReportSearchParams): Promise<SearchResponse> {
    return this.request('/api/v1/reports', params);
  }

  async searchUsers(params: UserSearchParams): Promise<SearchResponse> {
    return this.request('/api/v1/users/search', params);
  }

  async searchLocations(params: LocationSearchParams): Promise<SearchResponse> {
    return this.request('/api/v1/locations/search', params);
  }

  async globalSearch(params: GlobalSearchParams): Promise<GlobalSearchResponse> {
    return this.request('/api/v1/search/global', params);
  }

  // Utility function to convert search results to common format
  convertToSearchResults(results: any[], type: SearchResult['type']): SearchResult[] {
    return results.map(item => ({
      id: item.id,
      title: item.title || item.name || item.names || `${type} ${item.id}`,
      description: item.description || item.comment || item.email,
      type,
      metadata: this.extractMetadata(item, type),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      relevanceScore: item.relevanceScore,
    }));
  }

  private extractMetadata(item: any, type: SearchResult['type']): Record<string, any> {
    const metadata: Record<string, any> = {};

    switch (type) {
      case 'activity':
        if (item.village?.name) metadata.village = item.village.name;
        if (item.village?.cell?.name) metadata.cell = item.village.cell.name;
        if (item.date) metadata.date = item.date;
        if (item.status) metadata.status = item.status;
        break;

      case 'task':
        if (item.activity?.title) metadata.activity = item.activity.title;
        if (item.isibo?.name) metadata.isibo = item.isibo.name;
        if (item.status) metadata.status = item.status;
        if (item.estimatedCost) metadata.estimatedCost = item.estimatedCost;
        if (item.actualCost) metadata.actualCost = item.actualCost;
        break;

      case 'report':
        if (item.task?.title) metadata.task = item.task.title;
        if (item.activity?.title) metadata.activity = item.activity.title;
        if (item.task?.isibo?.name) metadata.isibo = item.task.isibo.name;
        if (item.evidenceUrls?.length > 0) metadata.hasEvidence = true;
        break;

      case 'user':
        if (item.role) metadata.role = item.role;
        if (item.email) metadata.email = item.email;
        if (item.phone) metadata.phone = item.phone;
        if (item.village?.name) metadata.village = item.village.name;
        if (item.cell?.name) metadata.cell = item.cell.name;
        break;

      case 'location':
        if (item.type) metadata.type = item.type;
        if (item.parentLocation?.name) metadata.parent = item.parentLocation.name;
        if (item.population) metadata.population = item.population;
        if (item.leader?.names) metadata.leader = item.leader.names;
        break;
    }

    return metadata;
  }
}

export const searchAPI = new SearchAPI();
