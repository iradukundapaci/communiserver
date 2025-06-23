import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Profile } from "../users/entities/profile.entity";
import { Activity } from "../activities/entities/activity.entity";
import { Task } from "../activities/entities/task.entity";
import { Report } from "../activities/entities/report.entity";
import { Village } from "../locations/entities/village.entity";
import { Cell } from "../locations/entities/cell.entity";
import { Isibo } from "../locations/entities/isibo.entity";
import { UserRole } from "../__shared__/enums/user-role.enum";
import { ETaskStatus } from "../activities/enum/ETaskStatus";
import {
  CoreMetricsDto,
  UserRoleStatsDto,
  LocationStatsDto,
  ActivityStatsDto,
  ReportStatsDto,
  TimeSeriesDataDto,
  LocationPerformanceDto,
  EngagementMetricsDto,
  FinancialAnalyticsDto,
  ParticipationAnalyticsDto,
  TaskPerformanceDto,
} from "./dto/analytics-response.dto";
import { AnalyticsQueryDto, TimeRange } from "./dto/analytics-query.dto";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Village)
    private villageRepository: Repository<Village>,
    @InjectRepository(Cell)
    private cellRepository: Repository<Cell>,
    @InjectRepository(Isibo)
    private isiboRepository: Repository<Isibo>,
  ) {}

  async getCoreMetrics(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<CoreMetricsDto> {
    const [
      userStats,
      locationStats,
      activityStats,
      reportStats,
      financialAnalytics,
      participationAnalytics,
      taskPerformance,
    ] = await Promise.all([
      this.getUserRoleStats(userProfile),
      this.getLocationStats(userProfile),
      this.getActivityStats(query, userProfile),
      this.getReportStats(query, userProfile),
      this.getFinancialAnalytics(query, userProfile),
      this.getParticipationAnalytics(query, userProfile),
      this.getTaskPerformance(query, userProfile),
    ]);

    return {
      userStats,
      locationStats,
      activityStats,
      reportStats,
      financialAnalytics,
      participationAnalytics,
      taskPerformance,
    };
  }

  async getUserRoleStats(userProfile?: Profile): Promise<UserRoleStatsDto[]> {
    let query = this.userRepository.createQueryBuilder("user");

    // Apply role-based filtering
    if (userProfile) {
      query = this.applyUserLocationFilter(query, userProfile, "user");
    }

    const userCounts = await query
      .select("user.role", "role")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.role")
      .getRawMany();

    const totalUsers = userCounts.reduce(
      (sum, item) => sum + parseInt(item.count),
      0,
    );

    return userCounts.map((item) => ({
      role: item.role,
      count: parseInt(item.count),
      percentage:
        totalUsers > 0
          ? Math.round((parseInt(item.count) / totalUsers) * 100)
          : 0,
    }));
  }

  async getLocationStats(userProfile?: Profile): Promise<LocationStatsDto> {
    let villageQuery = this.villageRepository.createQueryBuilder("village");
    let isiboQuery = this.isiboRepository.createQueryBuilder("isibo");
    let cellQuery = this.cellRepository.createQueryBuilder("cell");

    // Apply role-based filtering
    if (userProfile) {
      villageQuery = this.applyLocationFilter(
        villageQuery,
        userProfile,
        "village",
      );
      isiboQuery = this.applyLocationFilter(isiboQuery, userProfile, "isibo");
      cellQuery = this.applyLocationFilter(cellQuery, userProfile, "cell");
    }

    const [
      totalVillages,
      villagesWithLeaders,
      totalIsibos,
      isibosWithLeaders,
      totalCells,
    ] = await Promise.all([
      villageQuery.getCount(),
      villageQuery
        .clone()
        .where("village.hasLeader = :hasLeader", { hasLeader: true })
        .getCount(),
      isiboQuery.getCount(),
      isiboQuery
        .clone()
        .where("isibo.hasLeader = :hasLeader", { hasLeader: true })
        .getCount(),
      cellQuery.getCount(),
    ]);

    return {
      totalVillages,
      villagesWithLeaders,
      villagesWithoutLeaders: totalVillages - villagesWithLeaders,
      leadershipCoveragePercentage:
        totalVillages > 0
          ? Math.round((villagesWithLeaders / totalVillages) * 100)
          : 0,
      totalIsibos,
      isibosWithLeaders,
      isibosWithoutLeaders: totalIsibos - isibosWithLeaders,
      isiboLeadershipPercentage:
        totalIsibos > 0
          ? Math.round((isibosWithLeaders / totalIsibos) * 100)
          : 0,
      totalCells,
    };
  }

  async getActivityStats(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<ActivityStatsDto> {
    const dateRange = this.getDateRange(query);

    let activityQuery = this.activityRepository.createQueryBuilder("activity");
    let taskQuery = this.taskRepository.createQueryBuilder("task");

    // Apply date filtering
    if (dateRange.startDate && dateRange.endDate) {
      activityQuery = activityQuery.where(
        "activity.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
      taskQuery = taskQuery.where(
        "task.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    // Apply role-based filtering
    if (userProfile) {
      activityQuery = this.applyActivityLocationFilter(
        activityQuery,
        userProfile,
      );
      taskQuery = this.applyTaskLocationFilter(taskQuery, userProfile);
    }

    // Get activities with reports (activities that have at least one report)
    let activitiesWithReportsQuery = this.activityRepository
      .createQueryBuilder("activity")
      .leftJoin("activity.tasks", "task")
      .leftJoin(Report, "report", "report.taskId = task.id")
      .where("report.id IS NOT NULL");

    if (dateRange.startDate && dateRange.endDate) {
      activitiesWithReportsQuery = activitiesWithReportsQuery.andWhere(
        "activity.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (userProfile) {
      activitiesWithReportsQuery = this.applyActivityLocationFilter(
        activitiesWithReportsQuery,
        userProfile,
      );
    }

    const [
      totalActivities,
      activitiesWithReports,
      totalTasks,
      completedTasks,
      pendingTasks,
      cancelledTasks,
    ] = await Promise.all([
      activityQuery.getCount(),
      activitiesWithReportsQuery.getCount(),
      taskQuery.getCount(),
      taskQuery
        .clone()
        .where("task.status = :status", { status: ETaskStatus.COMPLETED })
        .getCount(),
      taskQuery
        .clone()
        .where("task.status = :status", { status: ETaskStatus.PENDING })
        .getCount(),
      taskQuery
        .clone()
        .where("task.status = :status", { status: ETaskStatus.CANCELLED })
        .getCount(),
    ]);

    const activitiesWithoutReports = totalActivities - activitiesWithReports;
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const activityReportingRate =
      totalActivities > 0
        ? Math.round((activitiesWithReports / totalActivities) * 100)
        : 0;

    return {
      totalActivities,
      activitiesWithReports,
      activitiesWithoutReports,
      totalTasks,
      activeTasks: pendingTasks, // Pending tasks are considered "active"
      completedTasks,
      pendingTasks,
      cancelledTasks,
      taskCompletionRate,
      activityReportingRate,
    };
  }

  async getReportStats(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<ReportStatsDto> {
    const dateRange = this.getDateRange(query);

    let reportQuery = this.reportRepository.createQueryBuilder("report");

    // Apply date filtering
    if (dateRange.startDate && dateRange.endDate) {
      reportQuery = reportQuery.where(
        "report.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    // Apply role-based filtering
    if (userProfile) {
      reportQuery = this.applyReportLocationFilter(reportQuery, userProfile);
    }

    const [
      totalReports,
      reportsWithEvidence,
      reportsWithChallenges,
      reportsWithSuggestions,
      reportsWithMaterials,
      attendanceData,
      evidenceData,
    ] = await Promise.all([
      reportQuery.getCount(),
      reportQuery
        .clone()
        .where("report.evidenceUrls IS NOT NULL")
        .andWhere("array_length(report.evidenceUrls, 1) > 0")
        .getCount(),
      reportQuery
        .clone()
        .where("report.challengesFaced IS NOT NULL")
        .andWhere("report.challengesFaced != :empty", { empty: "" })
        .getCount(),
      reportQuery
        .clone()
        .where("report.suggestions IS NOT NULL")
        .andWhere("report.suggestions != :empty", { empty: "" })
        .getCount(),
      reportQuery
        .clone()
        .where("report.materialsUsed IS NOT NULL")
        .andWhere("array_length(report.materialsUsed, 1) > 0")
        .getCount(),
      reportQuery
        .clone()
        .leftJoin("report.attendance", "attendance")
        .select(["report.id", "COUNT(attendance.id) as attendanceCount"])
        .groupBy("report.id")
        .getRawMany(),
      reportQuery
        .clone()
        .select([
          "report.id",
          "array_length(report.evidenceUrls, 1) as evidenceCount",
        ])
        .where("report.evidenceUrls IS NOT NULL")
        .getRawMany(),
    ]);

    const totalAttendees = attendanceData.reduce((sum, report) => {
      const attendanceCount = parseInt(report.attendanceCount) || 0;
      return sum + attendanceCount;
    }, 0);

    const totalEvidenceFiles = evidenceData.reduce((sum, report) => {
      const evidenceCount = parseInt(report.evidenceCount) || 0;
      return sum + evidenceCount;
    }, 0);

    const averageAttendance =
      totalReports > 0 ? Math.round(totalAttendees / totalReports) : 0;
    const evidencePercentage =
      totalReports > 0
        ? Math.round((reportsWithEvidence / totalReports) * 100)
        : 0;
    const averageEvidencePerReport =
      reportsWithEvidence > 0
        ? Math.round((totalEvidenceFiles / reportsWithEvidence) * 100) / 100
        : 0;

    return {
      totalReports,
      reportsWithEvidence,
      reportsWithoutEvidence: totalReports - reportsWithEvidence,
      evidencePercentage,
      averageAttendance,
      totalAttendees,
      reportsWithChallenges,
      reportsWithSuggestions,
      reportsWithMaterials,
      averageEvidencePerReport,
    };
  }

  private getDateRange(query: AnalyticsQueryDto): {
    startDate?: Date;
    endDate?: Date;
  } {
    if (query.startDate && query.endDate) {
      return {
        startDate: new Date(query.startDate),
        endDate: new Date(query.endDate),
      };
    }

    const endDate = new Date();
    const startDate = new Date();

    switch (query.timeRange) {
      case TimeRange.LAST_7_DAYS:
        startDate.setDate(endDate.getDate() - 7);
        break;
      case TimeRange.LAST_30_DAYS:
        startDate.setDate(endDate.getDate() - 30);
        break;
      case TimeRange.LAST_90_DAYS:
        startDate.setDate(endDate.getDate() - 90);
        break;
      case TimeRange.LAST_YEAR:
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  }

  private applyUserLocationFilter(
    query: any,
    userProfile: Profile | undefined,
    alias: string,
  ): any {
    if (!userProfile || !userProfile.user) {
      return query; // No user profile, return all data
    }

    if (userProfile.user.role === UserRole.ADMIN) {
      return query; // Admin sees all
    }

    if (
      userProfile.user.role === UserRole.CELL_LEADER &&
      userProfile.cell?.id
    ) {
      return query
        .leftJoin(`${alias}.profile`, "profile")
        .leftJoin("profile.cell", "profileCell")
        .where("profileCell.id = :cellId", { cellId: userProfile.cell.id });
    }

    if (
      userProfile.user.role === UserRole.VILLAGE_LEADER &&
      userProfile.village?.id
    ) {
      return query
        .leftJoin(`${alias}.profile`, "profile")
        .leftJoin("profile.village", "profileVillage")
        .where("profileVillage.id = :villageId", {
          villageId: userProfile.village.id,
        });
    }

    if (
      userProfile.user.role === UserRole.ISIBO_LEADER &&
      userProfile.isibo?.id
    ) {
      return query
        .leftJoin(`${alias}.profile`, "profile")
        .leftJoin("profile.isibo", "profileIsibo")
        .where("profileIsibo.id = :isiboId", { isiboId: userProfile.isibo.id });
    }

    return query;
  }

  private applyLocationFilter(
    query: any,
    userProfile: Profile | undefined,
    entityType: string,
  ): any {
    if (!userProfile || !userProfile.user) {
      return query; // No user profile, return all data
    }

    if (userProfile.user.role === UserRole.ADMIN) {
      return query; // Admin sees all
    }

    if (
      userProfile.user.role === UserRole.CELL_LEADER &&
      userProfile.cell?.id
    ) {
      if (entityType === "village") {
        return query
          .leftJoin("village.cell", "cell")
          .where("cell.id = :cellId", { cellId: userProfile.cell.id });
      }
      if (entityType === "isibo") {
        return query
          .leftJoin("isibo.village", "village")
          .leftJoin("village.cell", "cell")
          .where("cell.id = :cellId", { cellId: userProfile.cell.id });
      }
      if (entityType === "cell") {
        return query.where("cell.id = :cellId", {
          cellId: userProfile.cell.id,
        });
      }
    }

    if (
      userProfile.user.role === UserRole.VILLAGE_LEADER &&
      userProfile.village?.id
    ) {
      if (entityType === "village") {
        return query.where("village.id = :villageId", {
          villageId: userProfile.village.id,
        });
      }
      if (entityType === "isibo") {
        return query
          .leftJoin("isibo.village", "village")
          .where("village.id = :villageId", {
            villageId: userProfile.village.id,
          });
      }
    }

    if (
      userProfile.user.role === UserRole.ISIBO_LEADER &&
      userProfile.isibo?.id
    ) {
      if (entityType === "isibo") {
        return query.where("isibo.id = :isiboId", {
          isiboId: userProfile.isibo.id,
        });
      }
    }

    return query;
  }

  private applyActivityLocationFilter(query: any, userProfile?: Profile): any {
    if (!userProfile || !userProfile.user) {
      return query; // No user profile, return all data
    }

    if (userProfile.user.role === UserRole.ADMIN) {
      return query; // Admin sees all
    }

    if (
      userProfile.user.role === UserRole.CELL_LEADER &&
      userProfile.cell?.id
    ) {
      return query
        .leftJoin("activity.village", "village")
        .leftJoin("village.cell", "cell")
        .where("cell.id = :cellId", { cellId: userProfile.cell.id });
    }

    if (
      userProfile.user.role === UserRole.VILLAGE_LEADER &&
      userProfile.village?.id
    ) {
      return query
        .leftJoin("activity.village", "village")
        .where("village.id = :villageId", {
          villageId: userProfile.village.id,
        });
    }

    if (
      userProfile.user.role === UserRole.ISIBO_LEADER &&
      userProfile.isibo?.id
    ) {
      return query
        .leftJoin("activity.tasks", "task")
        .leftJoin("task.isibo", "isibo")
        .where("isibo.id = :isiboId", { isiboId: userProfile.isibo.id });
    }

    return query;
  }

  private applyTaskLocationFilter(query: any, userProfile?: Profile): any {
    if (!userProfile || !userProfile.user) {
      return query; // No user profile, return all data
    }

    if (userProfile.user.role === UserRole.ADMIN) {
      return query; // Admin sees all
    }

    if (
      userProfile.user.role === UserRole.CELL_LEADER &&
      userProfile.cell?.id
    ) {
      return query
        .leftJoin("task.isibo", "isibo")
        .leftJoin("isibo.village", "village")
        .leftJoin("village.cell", "cell")
        .where("cell.id = :cellId", { cellId: userProfile.cell.id });
    }

    if (
      userProfile.user.role === UserRole.VILLAGE_LEADER &&
      userProfile.village?.id
    ) {
      return query
        .leftJoin("task.isibo", "isibo")
        .leftJoin("isibo.village", "village")
        .where("village.id = :villageId", {
          villageId: userProfile.village.id,
        });
    }

    if (
      userProfile.user.role === UserRole.ISIBO_LEADER &&
      userProfile.isibo?.id
    ) {
      return query
        .leftJoin("task.isibo", "isibo")
        .where("isibo.id = :isiboId", { isiboId: userProfile.isibo.id });
    }

    return query;
  }

  private applyReportLocationFilter(query: any, userProfile?: Profile): any {
    if (!userProfile || !userProfile.user) {
      return query; // No user profile, return all data
    }

    if (userProfile.user.role === UserRole.ADMIN) {
      return query; // Admin sees all
    }

    if (
      userProfile.user.role === UserRole.CELL_LEADER &&
      userProfile.cell?.id
    ) {
      return query
        .leftJoin("report.task", "task")
        .leftJoin("task.isibo", "isibo")
        .leftJoin("isibo.village", "village")
        .leftJoin("village.cell", "cell")
        .where("cell.id = :cellId", { cellId: userProfile.cell.id });
    }

    if (
      userProfile.user.role === UserRole.VILLAGE_LEADER &&
      userProfile.village?.id
    ) {
      return query
        .leftJoin("report.task", "task")
        .leftJoin("task.isibo", "isibo")
        .leftJoin("isibo.village", "village")
        .where("village.id = :villageId", {
          villageId: userProfile.village.id,
        });
    }

    if (
      userProfile.user.role === UserRole.ISIBO_LEADER &&
      userProfile.isibo?.id
    ) {
      return query
        .leftJoin("report.task", "task")
        .leftJoin("task.isibo", "isibo")
        .where("isibo.id = :isiboId", { isiboId: userProfile.isibo.id });
    }

    return query;
  }

  async getTimeSeriesData(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<TimeSeriesDataDto[]> {
    const dateRange = this.getDateRange(query);
    const days = this.getDaysBetweenDates(
      dateRange.startDate!,
      dateRange.endDate!,
    );

    const timeSeriesData: TimeSeriesDataDto[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(dateRange.startDate!);
      currentDate.setDate(currentDate.getDate() + i);
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const [activities, tasks, reports, completedTasks] = await Promise.all([
        this.getCountForDate("activity", currentDate, nextDate, userProfile),
        this.getCountForDate("task", currentDate, nextDate, userProfile),
        this.getCountForDate("report", currentDate, nextDate, userProfile),
        this.getCompletedTasksForDate(currentDate, nextDate, userProfile),
      ]);

      timeSeriesData.push({
        date: currentDate.toISOString().split("T")[0],
        activities,
        tasks,
        reports,
        completedTasks,
      });
    }

    return timeSeriesData;
  }

  async getLocationPerformance(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<LocationPerformanceDto[]> {
    const dateRange = this.getDateRange(query);

    // Get village performance data by joining through activities and tasks
    let villageQuery = this.villageRepository
      .createQueryBuilder("village")
      .leftJoin("village.isibos", "isibo")
      .leftJoin(Task, "task", "task.isibo_id = isibo.id")
      .leftJoin("task.activity", "activity")
      .leftJoin(Report, "report", "report.taskId = task.id")
      .select([
        "village.id as locationId",
        "village.name as locationName",
        "COUNT(DISTINCT activity.id) as totalActivities",
        "COUNT(DISTINCT CASE WHEN task.status = :completedStatus THEN task.id END) as completedTasks",
        "COUNT(DISTINCT task.id) as totalTasks",
        "COUNT(DISTINCT report.id) as totalReports",
      ])
      .setParameter("completedStatus", ETaskStatus.COMPLETED)
      .groupBy("village.id, village.name");

    // Apply role-based filtering
    if (userProfile) {
      villageQuery = this.applyLocationFilter(
        villageQuery,
        userProfile,
        "village",
      );
    }

    if (dateRange.startDate && dateRange.endDate) {
      villageQuery = villageQuery.where(
        "activity.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    const results = await villageQuery
      .orderBy("totalActivities", "DESC")
      .limit(10)
      .getRawMany();

    return results.map((result) => ({
      locationId: result.locationId,
      locationName: result.locationName,
      locationType: "village" as const,
      totalActivities: parseInt(result.totalActivities) || 0,
      completedTasks: parseInt(result.completedTasks) || 0,
      totalTasks: parseInt(result.totalTasks) || 0,
      completionRate:
        result.totalTasks > 0
          ? Math.round((result.completedTasks / result.totalTasks) * 100)
          : 0,
      totalReports: parseInt(result.totalReports) || 0,
    }));
  }

  async getEngagementMetrics(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<EngagementMetricsDto> {
    let isiboQuery = this.isiboRepository.createQueryBuilder("isibo");

    // Apply role-based filtering
    if (userProfile) {
      isiboQuery = this.applyLocationFilter(isiboQuery, userProfile, "isibo");
    }

    const isibos = await isiboQuery
      .leftJoin("isibo.members", "members")
      .select(["isibo.id", "COUNT(members.id) as memberCount"])
      .groupBy("isibo.id")
      .getRawMany();

    const totalCitizens = isibos.reduce((sum, isibo) => {
      const memberCount = parseInt(isibo.memberCount) || 0;
      return sum + memberCount;
    }, 0);

    const totalIsibosWithMembers = isibos.length;
    const averageCitizensPerIsibo =
      totalIsibosWithMembers > 0
        ? Math.round(totalCitizens / totalIsibosWithMembers)
        : 0;

    const mostActiveVillages = await this.getLocationPerformance(
      query,
      userProfile,
    );

    // Calculate report submission frequency (reports per day)
    const dateRange = this.getDateRange(query);
    const daysDiff = this.getDaysBetweenDates(
      dateRange.startDate!,
      dateRange.endDate!,
    );

    let reportQuery = this.reportRepository.createQueryBuilder("report");
    if (dateRange.startDate && dateRange.endDate) {
      reportQuery = reportQuery.where(
        "report.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (userProfile) {
      reportQuery = this.applyReportLocationFilter(reportQuery, userProfile);
    }

    const totalReports = await reportQuery.getCount();
    const reportSubmissionFrequency =
      daysDiff > 0 ? Math.round((totalReports / daysDiff) * 100) / 100 : 0;

    return {
      averageCitizensPerIsibo,
      mostActiveVillages: mostActiveVillages.slice(0, 5), // Top 5
      reportSubmissionFrequency,
      totalCitizens,
    };
  }

  async getFinancialAnalytics(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<FinancialAnalyticsDto> {
    const dateRange = this.getDateRange(query);

    // Get financial data from reports
    let reportQuery = this.reportRepository.createQueryBuilder("report");

    if (dateRange.startDate && dateRange.endDate) {
      reportQuery = reportQuery.where(
        "report.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (userProfile) {
      reportQuery = this.applyReportLocationFilter(reportQuery, userProfile);
    }

    const reports = await reportQuery.getMany();

    // Calculate totals
    const totalEstimatedCost = reports.reduce(
      (sum, report) => sum + (Number(report.estimatedCost) || 0),
      0,
    );
    const totalActualCost = reports.reduce(
      (sum, report) => sum + (Number(report.actualCost) || 0),
      0,
    );
    const totalEstimatedImpact = reports.reduce(
      (sum, report) => sum + (Number(report.expectedFinancialImpact) || 0),
      0,
    );
    const totalActualImpact = reports.reduce(
      (sum, report) => sum + (Number(report.actualFinancialImpact) || 0),
      0,
    );

    // Calculate variances
    const costVariance = totalActualCost - totalEstimatedCost;
    const costVariancePercentage =
      totalEstimatedCost > 0 ? (costVariance / totalEstimatedCost) * 100 : 0;
    const impactVariance = totalActualImpact - totalEstimatedImpact;
    const impactVariancePercentage =
      totalEstimatedImpact > 0
        ? (impactVariance / totalEstimatedImpact) * 100
        : 0;

    // Get activity and task counts for averages
    const activityCount = await this.getActivityCount(query, userProfile);
    const taskCount = await this.getTaskCount(query, userProfile);

    const averageCostPerActivity =
      activityCount > 0 ? totalActualCost / activityCount : 0;
    const averageCostPerTask = taskCount > 0 ? totalActualCost / taskCount : 0;
    const budgetEfficiency =
      totalEstimatedCost > 0
        ? (totalActualCost / totalEstimatedCost) * 100
        : 100;

    return {
      totalEstimatedCost,
      totalActualCost,
      costVariance,
      costVariancePercentage: Math.round(costVariancePercentage * 100) / 100,
      totalEstimatedImpact,
      totalActualImpact,
      impactVariance,
      impactVariancePercentage:
        Math.round(impactVariancePercentage * 100) / 100,
      averageCostPerActivity: Math.round(averageCostPerActivity),
      averageCostPerTask: Math.round(averageCostPerTask),
      budgetEfficiency: Math.round(budgetEfficiency * 100) / 100,
    };
  }

  async getParticipationAnalytics(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<ParticipationAnalyticsDto> {
    const dateRange = this.getDateRange(query);

    let reportQuery = this.reportRepository.createQueryBuilder("report");

    if (dateRange.startDate && dateRange.endDate) {
      reportQuery = reportQuery.where(
        "report.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (userProfile) {
      reportQuery = this.applyReportLocationFilter(reportQuery, userProfile);
    }

    const reports = await reportQuery.getMany();

    const totalExpectedParticipants = reports.reduce(
      (sum, report) => sum + (Number(report.expectedParticipants) || 0),
      0,
    );
    const totalActualParticipants = reports.reduce(
      (sum, report) => sum + (Number(report.actualParticipants) || 0),
      0,
    );

    const participationRate =
      totalExpectedParticipants > 0
        ? (totalActualParticipants / totalExpectedParticipants) * 100
        : 0;

    const activityCount = await this.getActivityCount(query, userProfile);
    const taskCount = await this.getTaskCount(query, userProfile);

    const averageParticipantsPerActivity =
      activityCount > 0 ? totalActualParticipants / activityCount : 0;
    const averageParticipantsPerTask =
      taskCount > 0 ? totalActualParticipants / taskCount : 0;

    return {
      totalExpectedParticipants,
      totalActualParticipants,
      participationRate: Math.round(participationRate * 100) / 100,
      averageParticipantsPerActivity:
        Math.round(averageParticipantsPerActivity * 100) / 100,
      averageParticipantsPerTask:
        Math.round(averageParticipantsPerTask * 100) / 100,
    };
  }

  async getTaskPerformance(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<TaskPerformanceDto> {
    const dateRange = this.getDateRange(query);

    let taskQuery = this.taskRepository.createQueryBuilder("task");

    if (dateRange.startDate && dateRange.endDate) {
      taskQuery = taskQuery.where(
        "task.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (userProfile) {
      taskQuery = this.applyTaskLocationFilter(taskQuery, userProfile);
    }

    const [totalTasks, completedTasks, pendingTasks, cancelledTasks] =
      await Promise.all([
        taskQuery.getCount(),
        taskQuery
          .clone()
          .andWhere("task.status = :status", { status: ETaskStatus.COMPLETED })
          .getCount(),
        taskQuery
          .clone()
          .andWhere("task.status = :status", { status: ETaskStatus.PENDING })
          .getCount(),
        taskQuery
          .clone()
          .andWhere("task.status = :status", { status: ETaskStatus.CANCELLED })
          .getCount(),
      ]);

    const taskCompletionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const activityCount = await this.getActivityCount(query, userProfile);
    const averageTasksPerActivity =
      activityCount > 0 ? totalTasks / activityCount : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      cancelledTasks,
      taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
      averageTasksPerActivity: Math.round(averageTasksPerActivity * 100) / 100,
    };
  }

  private async getActivityCount(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<number> {
    const dateRange = this.getDateRange(query);

    let activityQuery = this.activityRepository.createQueryBuilder("activity");

    if (dateRange.startDate && dateRange.endDate) {
      activityQuery = activityQuery.where(
        "activity.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (userProfile) {
      activityQuery = this.applyActivityLocationFilter(
        activityQuery,
        userProfile,
      );
    }

    return activityQuery.getCount();
  }

  private async getTaskCount(
    query: AnalyticsQueryDto,
    userProfile?: Profile,
  ): Promise<number> {
    const dateRange = this.getDateRange(query);

    let taskQuery = this.taskRepository.createQueryBuilder("task");

    if (dateRange.startDate && dateRange.endDate) {
      taskQuery = taskQuery.where(
        "task.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (userProfile) {
      taskQuery = this.applyTaskLocationFilter(taskQuery, userProfile);
    }

    return taskQuery.getCount();
  }

  private async getCountForDate(
    entityType: "activity" | "task" | "report",
    startDate: Date,
    endDate: Date,
    userProfile?: Profile,
  ): Promise<number> {
    let query: any;

    switch (entityType) {
      case "activity":
        query = this.activityRepository.createQueryBuilder("activity");
        if (userProfile) {
          query = this.applyActivityLocationFilter(query, userProfile);
        }
        break;
      case "task":
        query = this.taskRepository.createQueryBuilder("task");
        if (userProfile) {
          query = this.applyTaskLocationFilter(query, userProfile);
        }
        break;
      case "report":
        query = this.reportRepository.createQueryBuilder("report");
        if (userProfile) {
          query = this.applyReportLocationFilter(query, userProfile);
        }
        break;
    }

    return query
      .where(
        `${entityType}.createdAt >= :startDate AND ${entityType}.createdAt < :endDate`,
        {
          startDate,
          endDate,
        },
      )
      .getCount();
  }

  private async getCompletedTasksForDate(
    startDate: Date,
    endDate: Date,
    userProfile?: Profile,
  ): Promise<number> {
    let query = this.taskRepository.createQueryBuilder("task");

    if (userProfile) {
      query = this.applyTaskLocationFilter(query, userProfile);
    }

    return query
      .where("task.updatedAt >= :startDate AND task.updatedAt < :endDate", {
        startDate,
        endDate,
      })
      .andWhere("task.status = :status", { status: ETaskStatus.COMPLETED })
      .getCount();
  }

  private getDaysBetweenDates(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
