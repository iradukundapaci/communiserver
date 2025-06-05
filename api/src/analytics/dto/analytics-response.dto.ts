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
  activitiesWithReports: number;

  @ApiProperty()
  activitiesWithoutReports: number;

  @ApiProperty()
  totalTasks: number;

  @ApiProperty()
  activeTasks: number;

  @ApiProperty()
  completedTasks: number;

  @ApiProperty()
  pendingTasks: number;

  @ApiProperty()
  cancelledTasks: number;

  @ApiProperty()
  taskCompletionRate: number;

  @ApiProperty()
  activityReportingRate: number;
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

  @ApiProperty()
  reportsWithChallenges: number;

  @ApiProperty()
  reportsWithSuggestions: number;

  @ApiProperty()
  reportsWithMaterials: number;

  @ApiProperty()
  averageEvidencePerReport: number;
}

export class FinancialAnalyticsDto {
  @ApiProperty()
  totalEstimatedCost: number;

  @ApiProperty()
  totalActualCost: number;

  @ApiProperty()
  costVariance: number;

  @ApiProperty()
  costVariancePercentage: number;

  @ApiProperty()
  totalEstimatedImpact: number;

  @ApiProperty()
  totalActualImpact: number;

  @ApiProperty()
  impactVariance: number;

  @ApiProperty()
  impactVariancePercentage: number;

  @ApiProperty()
  averageCostPerActivity: number;

  @ApiProperty()
  averageCostPerTask: number;

  @ApiProperty()
  budgetEfficiency: number;
}

export class ParticipationAnalyticsDto {
  @ApiProperty()
  totalExpectedParticipants: number;

  @ApiProperty()
  totalActualParticipants: number;

  @ApiProperty()
  participationRate: number;

  @ApiProperty()
  averageParticipantsPerActivity: number;

  @ApiProperty()
  averageParticipantsPerTask: number;
}

export class TaskPerformanceDto {
  @ApiProperty()
  totalTasks: number;

  @ApiProperty()
  completedTasks: number;

  @ApiProperty()
  pendingTasks: number;

  @ApiProperty()
  cancelledTasks: number;

  @ApiProperty()
  taskCompletionRate: number;

  @ApiProperty()
  averageTasksPerActivity: number;
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

  @ApiProperty()
  financialAnalytics: FinancialAnalyticsDto;

  @ApiProperty()
  participationAnalytics: ParticipationAnalyticsDto;

  @ApiProperty()
  taskPerformance: TaskPerformanceDto;
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
