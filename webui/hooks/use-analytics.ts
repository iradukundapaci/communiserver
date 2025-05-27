import { useState, useEffect, useCallback } from 'react';
import {
  analyticsAPI,
  type DashboardSummary,
  type CoreMetrics,
  type TimeSeriesData,
  type LocationPerformance,
  type EngagementMetrics,
  type AnalyticsQuery
} from '@/lib/api/analytics';
import { toast } from 'sonner';

interface UseAnalyticsState {
  dashboardSummary: DashboardSummary | null;
  coreMetrics: CoreMetrics | null;
  timeSeriesData: TimeSeriesData[];
  locationPerformance: LocationPerformance[];
  engagementMetrics: EngagementMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseAnalyticsReturn extends UseAnalyticsState {
  refreshAnalytics: (query?: AnalyticsQuery) => Promise<void>;
  refreshCoreMetrics: (query?: AnalyticsQuery) => Promise<void>;
  refreshTimeSeriesData: (query?: AnalyticsQuery) => Promise<void>;
  refreshLocationPerformance: (query?: AnalyticsQuery) => Promise<void>;
  refreshEngagementMetrics: (query?: AnalyticsQuery) => Promise<void>;
}

export function useAnalytics(initialQuery: AnalyticsQuery = { timeRange: '30d' }): UseAnalyticsReturn {
  const [state, setState] = useState<UseAnalyticsState>({
    dashboardSummary: null,
    coreMetrics: null,
    timeSeriesData: [],
    locationPerformance: [],
    engagementMetrics: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const refreshDashboardSummary = useCallback(async (query: AnalyticsQuery = initialQuery) => {
    try {
      setLoading(true);
      setError(null);

      const dashboardSummary = await analyticsAPI.getDashboardSummary(query);

      setState(prev => ({
        ...prev,
        dashboardSummary,
        coreMetrics: dashboardSummary.coreMetrics,
        timeSeriesData: dashboardSummary.timeSeriesData,
        locationPerformance: dashboardSummary.locationPerformance,
        engagementMetrics: dashboardSummary.engagementMetrics,
        lastUpdated: new Date(),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      setLoading(false);
      toast.error('Failed to load analytics data');
      console.error('Analytics error:', error);
    }
  }, [initialQuery, setLoading, setError]);

  const refreshCoreMetrics = useCallback(async (query: AnalyticsQuery = initialQuery) => {
    try {
      setLoading(true);
      setError(null);

      const coreMetrics = await analyticsAPI.getCoreMetrics(query);

      setState(prev => ({
        ...prev,
        coreMetrics,
        lastUpdated: new Date(),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch core metrics';
      setError(errorMessage);
      setLoading(false);
      toast.error('Failed to load core metrics');
    }
  }, [initialQuery, setLoading, setError]);

  const refreshTimeSeriesData = useCallback(async (query: AnalyticsQuery = initialQuery) => {
    try {
      setLoading(true);
      setError(null);

      const timeSeriesData = await analyticsAPI.getTimeSeriesData(query);

      setState(prev => ({
        ...prev,
        timeSeriesData,
        lastUpdated: new Date(),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch time series data';
      setError(errorMessage);
      setLoading(false);
      toast.error('Failed to load time series data');
    }
  }, [initialQuery, setLoading, setError]);

  const refreshLocationPerformance = useCallback(async (query: AnalyticsQuery = initialQuery) => {
    try {
      setLoading(true);
      setError(null);

      const locationPerformance = await analyticsAPI.getLocationPerformance(query);

      setState(prev => ({
        ...prev,
        locationPerformance,
        lastUpdated: new Date(),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch location performance';
      setError(errorMessage);
      setLoading(false);
      toast.error('Failed to load location performance');
    }
  }, [initialQuery, setLoading, setError]);

  const refreshEngagementMetrics = useCallback(async (query: AnalyticsQuery = initialQuery) => {
    try {
      setLoading(true);
      setError(null);

      const engagementMetrics = await analyticsAPI.getEngagementMetrics(query);

      setState(prev => ({
        ...prev,
        engagementMetrics,
        lastUpdated: new Date(),
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch engagement metrics';
      setError(errorMessage);
      setLoading(false);
      toast.error('Failed to load engagement metrics');
    }
  }, [initialQuery, setLoading, setError]);

  // Load dashboard summary on mount
  useEffect(() => {
    refreshDashboardSummary(initialQuery);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    refreshAnalytics: refreshDashboardSummary,
    refreshCoreMetrics,
    refreshTimeSeriesData,
    refreshLocationPerformance,
    refreshEngagementMetrics,
  };
}

// Hook for individual analytics components
export function useCoreMetrics(query: AnalyticsQuery = { timeRange: '30d' }) {
  const [coreMetrics, setCoreMetrics] = useState<CoreMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (newQuery: AnalyticsQuery = query) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await analyticsAPI.getCoreMetrics(newQuery);
      setCoreMetrics(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch core metrics';
      setError(errorMessage);
      toast.error('Failed to load core metrics');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    refresh(query);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { coreMetrics, isLoading, error, refresh };
}
