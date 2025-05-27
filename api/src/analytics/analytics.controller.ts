import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Profile } from '../users/entities/profile.entity';
import { AnalyticsService } from './analytics.service';
import {
  CoreMetricsDto,
  TimeSeriesDataDto,
  LocationPerformanceDto,
  EngagementMetricsDto,
} from './dto/analytics-response.dto';
import { AnalyticsQueryDto, TimeRange } from './dto/analytics-query.dto';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('core-metrics')
  @ApiOperation({
    summary: 'Get core analytics metrics',
    description: 'Retrieve core metrics including user stats, location stats, activity stats, and report stats',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Core metrics retrieved successfully',
    type: CoreMetricsDto,
  })
  @ApiQuery({ name: 'timeRange', enum: TimeRange, required: false })
  @ApiQuery({ name: 'startDate', type: String, required: false })
  @ApiQuery({ name: 'endDate', type: String, required: false })
  @ApiQuery({ name: 'locationId', type: String, required: false })
  async getCoreMetrics(
    @Query() query: AnalyticsQueryDto,
    @GetUser() userProfile: Profile,
  ): Promise<CoreMetricsDto> {
    return this.analyticsService.getCoreMetrics(query, userProfile);
  }

  @Get('time-series')
  @ApiOperation({
    summary: 'Get time series analytics data',
    description: 'Retrieve time series data for activities, tasks, and reports over a specified period',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Time series data retrieved successfully',
    type: [TimeSeriesDataDto],
  })
  @ApiQuery({ name: 'timeRange', enum: TimeRange, required: false })
  @ApiQuery({ name: 'startDate', type: String, required: false })
  @ApiQuery({ name: 'endDate', type: String, required: false })
  @ApiQuery({ name: 'locationId', type: String, required: false })
  async getTimeSeriesData(
    @Query() query: AnalyticsQueryDto,
    @GetUser() userProfile: Profile,
  ): Promise<TimeSeriesDataDto[]> {
    return this.analyticsService.getTimeSeriesData(query, userProfile);
  }

  @Get('location-performance')
  @ApiOperation({
    summary: 'Get location performance analytics',
    description: 'Retrieve performance metrics for different locations (villages, cells, isibos)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location performance data retrieved successfully',
    type: [LocationPerformanceDto],
  })
  @ApiQuery({ name: 'timeRange', enum: TimeRange, required: false })
  @ApiQuery({ name: 'startDate', type: String, required: false })
  @ApiQuery({ name: 'endDate', type: String, required: false })
  @ApiQuery({ name: 'locationId', type: String, required: false })
  async getLocationPerformance(
    @Query() query: AnalyticsQueryDto,
    @GetUser() userProfile: Profile,
  ): Promise<LocationPerformanceDto[]> {
    return this.analyticsService.getLocationPerformance(query, userProfile);
  }

  @Get('engagement-metrics')
  @ApiOperation({
    summary: 'Get community engagement metrics',
    description: 'Retrieve engagement metrics including citizen participation and activity levels',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Engagement metrics retrieved successfully',
    type: EngagementMetricsDto,
  })
  @ApiQuery({ name: 'timeRange', enum: TimeRange, required: false })
  @ApiQuery({ name: 'startDate', type: String, required: false })
  @ApiQuery({ name: 'endDate', type: String, required: false })
  @ApiQuery({ name: 'locationId', type: String, required: false })
  async getEngagementMetrics(
    @Query() query: AnalyticsQueryDto,
    @GetUser() userProfile: Profile,
  ): Promise<EngagementMetricsDto> {
    return this.analyticsService.getEngagementMetrics(query, userProfile);
  }

  @Get('dashboard-summary')
  @ApiOperation({
    summary: 'Get dashboard summary analytics',
    description: 'Retrieve a comprehensive summary of all analytics for the dashboard',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard summary retrieved successfully',
  })
  @ApiQuery({ name: 'timeRange', enum: TimeRange, required: false })
  @ApiQuery({ name: 'startDate', type: String, required: false })
  @ApiQuery({ name: 'endDate', type: String, required: false })
  async getDashboardSummary(
    @Query() query: AnalyticsQueryDto,
    @GetUser() userProfile: Profile,
  ) {
    const [coreMetrics, timeSeriesData, locationPerformance, engagementMetrics] = await Promise.all([
      this.analyticsService.getCoreMetrics(query, userProfile),
      this.analyticsService.getTimeSeriesData(query, userProfile),
      this.analyticsService.getLocationPerformance(query, userProfile),
      this.analyticsService.getEngagementMetrics(query, userProfile),
    ]);

    return {
      coreMetrics,
      timeSeriesData,
      locationPerformance,
      engagementMetrics,
      generatedAt: new Date().toISOString(),
      timeRange: query.timeRange || TimeRange.LAST_30_DAYS,
    };
  }
}
