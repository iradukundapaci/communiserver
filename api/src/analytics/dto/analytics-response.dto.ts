import { ApiProperty } from '@nestjs/swagger';

export class UserRoleStatsDto {
  @ApiProperty()
  role: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: number;
}

export class LocationStatsDto {
  @ApiProperty()
  totalVillages: number;

  @ApiProperty()
  villagesWithLeaders: number;

  @ApiProperty()
  villagesWithoutLeaders: number;

  @ApiProperty()
  leadershipCoveragePercentage: number;

  @ApiProperty()
  totalIsibos: number;

  @ApiProperty()
  isibosWithLeaders: number;

  @ApiProperty()
  isibosWithoutLeaders: number;

  @ApiProperty()
  isiboLeadershipPercentage: number;

  @ApiProperty()
  totalCells: number;
}

export class ActivityStatsDto {
  @ApiProperty()
  totalActivities: number;

  @ApiProperty()
  activeActivities: number;

  @ApiProperty()
  completedActivities: number;

  @ApiProperty()
  pendingActivities: number;

  @ApiProperty()
  totalTasks: number;

  @ApiProperty()
  activeTasks: number;

  @ApiProperty()
  completedTasks: number;

  @ApiProperty()
  pendingTasks: number;

  @ApiProperty()
  taskCompletionRate: number;
}

export class ReportStatsDto {
  @ApiProperty()
  totalReports: number;

  @ApiProperty()
  reportsWithEvidence: number;

  @ApiProperty()
  reportsWithoutEvidence: number;

  @ApiProperty()
  evidencePercentage: number;

  @ApiProperty()
  averageAttendance: number;

  @ApiProperty()
  totalAttendees: number;
}

export class CoreMetricsDto {
  @ApiProperty({ type: [UserRoleStatsDto] })
  userStats: UserRoleStatsDto[];

  @ApiProperty()
  locationStats: LocationStatsDto;

  @ApiProperty()
  activityStats: ActivityStatsDto;

  @ApiProperty()
  reportStats: ReportStatsDto;
}

export class TimeSeriesDataDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  activities: number;

  @ApiProperty()
  tasks: number;

  @ApiProperty()
  reports: number;

  @ApiProperty()
  completedTasks: number;
}

export class LocationPerformanceDto {
  @ApiProperty()
  locationId: string;

  @ApiProperty()
  locationName: string;

  @ApiProperty()
  locationType: 'village' | 'cell' | 'isibo';

  @ApiProperty()
  totalActivities: number;

  @ApiProperty()
  completedTasks: number;

  @ApiProperty()
  totalTasks: number;

  @ApiProperty()
  completionRate: number;

  @ApiProperty()
  totalReports: number;
}

export class EngagementMetricsDto {
  @ApiProperty()
  averageCitizensPerIsibo: number;

  @ApiProperty({ type: [LocationPerformanceDto] })
  mostActiveVillages: LocationPerformanceDto[];

  @ApiProperty()
  reportSubmissionFrequency: number;

  @ApiProperty()
  totalCitizens: number;
}
