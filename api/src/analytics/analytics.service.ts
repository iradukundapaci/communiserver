import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
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
    user?: User,
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
      this.getUserRoleStats(user),
      this.getLocationStats(user),
      this.getActivityStats(query, user),
      this.getReportStats(query, user),
      this.getFinancialAnalytics(query, user),
      this.getParticipationAnalytics(query, user),
      this.getTaskPerformance(query, user),
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

  async getUserRoleStats(user?: User): Promise<UserRoleStatsDto[]> {
    let query = this.userRepository.createQueryBuilder("user");

    if (user) {
      query = this.applyUserLocationFilter(query, user, "user");
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

  async getLocationStats(user?: User): Promise<LocationStatsDto> {
    let villageQuery = this.villageRepository.createQueryBuilder("village");
    let isiboQuery = this.isiboRepository.createQueryBuilder("isibo");
    let cellQuery = this.cellRepository.createQueryBuilder("cell");

    if (user) {
      villageQuery = this.applyLocationFilter(villageQuery, user, "village");
      isiboQuery = this.applyLocationFilter(isiboQuery, user, "isibo");
      cellQuery = this.applyLocationFilter(cellQuery, user, "cell");
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
    user?: User,
  ): Promise<ActivityStatsDto> {
    const dateRange = this.getDateRange(query);

    let activityQuery = this.activityRepository.createQueryBuilder("activity");
    let taskQuery = this.taskRepository.createQueryBuilder("task");

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

    if (user) {
      activityQuery = this.applyActivityLocationFilter(activityQuery, user);
      taskQuery = this.applyTaskLocationFilter(taskQuery, user);
    }

    // Count activities that have reports by checking reports table
    let activitiesWithReportsQuery = this.reportRepository
      .createQueryBuilder("report")
      .leftJoin("report.task", "task")
      .leftJoin("task.activity", "activity")
      .select("COUNT(DISTINCT activity.id)", "count");

    if (dateRange.startDate && dateRange.endDate) {
      activitiesWithReportsQuery = activitiesWithReportsQuery.andWhere(
        "activity.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (user) {
      activitiesWithReportsQuery = this.applyActivityLocationFilter(
        activitiesWithReportsQuery,
        user,
      );
    }

    const [totalActivities, totalTasks, completedTasks, activitiesWithReportsResult] =
      await Promise.all([
        activityQuery.getCount(),
        taskQuery.getCount(),
        taskQuery
          .clone()
          .where("task.status = :status", { status: ETaskStatus.COMPLETED })
          .getCount(),
        activitiesWithReportsQuery.getRawOne(),
      ]);

    const activitiesWithReports = parseInt(activitiesWithReportsResult?.count || "0");

    return {
      totalActivities,
      activitiesWithReports,
      activitiesWithoutReports: totalActivities - activitiesWithReports,
      totalTasks,
      activeTasks: totalTasks - completedTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      cancelledTasks: 0,
      taskCompletionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      activityReportingRate:
        totalActivities > 0
          ? Math.round((activitiesWithReports / totalActivities) * 100)
          : 0,
    };
  }

  async getReportStats(
    query: AnalyticsQueryDto,
    user?: User,
  ): Promise<ReportStatsDto> {
    const dateRange = this.getDateRange(query);

    let reportQuery = this.reportRepository.createQueryBuilder("report");

    if (dateRange.startDate && dateRange.endDate) {
      reportQuery = reportQuery.where(
        "report.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (user) {
      reportQuery = this.applyReportLocationFilter(reportQuery, user);
    }

    const totalReports = await reportQuery.getCount();

    return {
      totalReports,
      reportsWithEvidence: 0,
      reportsWithoutEvidence: totalReports,
      evidencePercentage: 0,
      averageAttendance: 0,
      totalAttendees: 0,
      reportsWithChallenges: 0,
      reportsWithSuggestions: 0,
      reportsWithMaterials: 0,
      averageEvidencePerReport: 0,
    };
  }

  async getFinancialAnalytics(
    query: AnalyticsQueryDto,
    user?: User,
  ): Promise<FinancialAnalyticsDto> {
    const dateRange = this.getDateRange(query);

    let reportQuery = this.reportRepository.createQueryBuilder("report")
      .leftJoinAndSelect("report.task", "task");

    if (dateRange.startDate && dateRange.endDate) {
      reportQuery = reportQuery.where(
        "report.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (user) {
      reportQuery = this.applyReportLocationFilter(reportQuery, user);
    }

    const reports = await reportQuery.getMany();

    // Calculate financial metrics from task data
    const totalEstimatedCost = reports.reduce((sum, report) =>
      sum + (Number(report.task?.estimatedCost) || 0), 0);
    const totalActualCost = reports.reduce((sum, report) =>
      sum + (Number(report.task?.actualCost) || 0), 0);
    const totalEstimatedImpact = reports.reduce((sum, report) =>
      sum + (Number(report.task?.expectedFinancialImpact) || 0), 0);
    const totalActualImpact = reports.reduce((sum, report) =>
      sum + (Number(report.task?.actualFinancialImpact) || 0), 0);

    const costVariance = totalActualCost - totalEstimatedCost;
    const costVariancePercentage = totalEstimatedCost > 0
      ? (costVariance / totalEstimatedCost) * 100 : 0;
    const impactVariance = totalActualImpact - totalEstimatedImpact;
    const impactVariancePercentage = totalEstimatedImpact > 0
      ? (impactVariance / totalEstimatedImpact) * 100 : 0;

    const activityCount = await this.getActivityCount(query, user);
    const taskCount = reports.length;

    return {
      totalEstimatedCost,
      totalActualCost,
      costVariance,
      costVariancePercentage,
      totalEstimatedImpact,
      totalActualImpact,
      impactVariance,
      impactVariancePercentage,
      averageCostPerActivity: activityCount > 0 ? totalActualCost / activityCount : 0,
      averageCostPerTask: taskCount > 0 ? totalActualCost / taskCount : 0,
      budgetEfficiency: totalEstimatedCost > 0 ? (totalEstimatedCost / totalActualCost) * 100 : 100,
    };
  }

  async getParticipationAnalytics(
    query: AnalyticsQueryDto,
    user?: User,
  ): Promise<ParticipationAnalyticsDto> {
    const dateRange = this.getDateRange(query);

    let reportQuery = this.reportRepository.createQueryBuilder("report")
      .leftJoinAndSelect("report.task", "task")
      .leftJoinAndSelect("report.attendance", "attendance");

    if (dateRange.startDate && dateRange.endDate) {
      reportQuery = reportQuery.where(
        "report.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (user) {
      reportQuery = this.applyReportLocationFilter(reportQuery, user);
    }

    const reports = await reportQuery.getMany();

    // Calculate participation metrics from task data
    const totalExpectedParticipants = reports.reduce((sum, report) =>
      sum + (Number(report.task?.expectedParticipants) || 0), 0);
    const totalActualParticipants = reports.reduce((sum, report) =>
      sum + (Number(report.task?.actualParticipants) || 0), 0);

    const participationRate = totalExpectedParticipants > 0
      ? Math.round((totalActualParticipants / totalExpectedParticipants) * 100) : 0;

    const activityCount = await this.getActivityCount(query, user);
    const taskCount = reports.length;

    return {
      totalExpectedParticipants,
      totalActualParticipants,
      participationRate,
      averageParticipantsPerActivity: activityCount > 0
        ? Math.round(totalActualParticipants / activityCount) : 0,
      averageParticipantsPerTask: taskCount > 0
        ? Math.round(totalActualParticipants / taskCount) : 0,
    };
  }

  async getTaskPerformance(
    query: AnalyticsQueryDto,
    user?: User,
  ): Promise<TaskPerformanceDto> {
    const dateRange = this.getDateRange(query);

    let taskQuery = this.taskRepository.createQueryBuilder("task");

    if (dateRange.startDate && dateRange.endDate) {
      taskQuery = taskQuery.where(
        "task.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (user) {
      taskQuery = this.applyTaskLocationFilter(taskQuery, user);
    }

    const totalTasks = await taskQuery.getCount();
    const completedTasks = await taskQuery
      .clone()
      .where("task.status = :status", { status: ETaskStatus.COMPLETED })
      .getCount();

    const activityCount = await this.getActivityCount(query, user);

    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      cancelledTasks: 0,
      taskCompletionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      averageTasksPerActivity:
        activityCount > 0 ? totalTasks / activityCount : 0,
    };
  }

  async getTimeSeriesData(
    query: AnalyticsQueryDto,
    user?: User,
  ): Promise<TimeSeriesDataDto[]> {
    const dateRange = this.getDateRange(query);
    const days = this.getDaysBetweenDates(
      dateRange.startDate || new Date(),
      dateRange.endDate || new Date(),
    );

    const timeSeriesData: TimeSeriesDataDto[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(dateRange.startDate || new Date());
      currentDate.setDate(currentDate.getDate() + i);
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const [activityCount, taskCount, reportCount, completedTasks] =
        await Promise.all([
          this.getCountForDate("activity", currentDate, nextDate, user),
          this.getCountForDate("task", currentDate, nextDate, user),
          this.getCountForDate("report", currentDate, nextDate, user),
          this.getCompletedTasksForDate(currentDate, nextDate, user),
        ]);

      timeSeriesData.push({
        date: currentDate.toISOString().split("T")[0],
        activities: activityCount,
        tasks: taskCount,
        reports: reportCount,
        completedTasks,
      });
    }

    return timeSeriesData;
  }

  async getLocationPerformance(
    query: AnalyticsQueryDto,
    user?: User,
  ): Promise<LocationPerformanceDto[]> {
    const dateRange = this.getDateRange(query);

    let isiboQuery = this.isiboRepository.createQueryBuilder("isibo");

    if (user) {
      isiboQuery = this.applyLocationFilter(isiboQuery, user, "isibo");
    }

    const isibos = await isiboQuery.getMany();

    const locationPerformance: LocationPerformanceDto[] = [];

    for (const isibo of isibos) {
      // Get tasks for this isibo
      let taskQuery = this.taskRepository
        .createQueryBuilder("task")
        .leftJoin("task.isibo", "isibo")
        .where("isibo.id = :isiboId", { isiboId: isibo.id });

      if (dateRange.startDate && dateRange.endDate) {
        taskQuery = taskQuery.andWhere(
          "task.createdAt BETWEEN :startDate AND :endDate",
          dateRange,
        );
      }

      const tasks = await taskQuery.getMany();
      const completedTasks = tasks.filter(
        (task) => task.status === ETaskStatus.COMPLETED,
      ).length;

      // Get reports for this isibo
      let reportQuery = this.reportRepository
        .createQueryBuilder("report")
        .leftJoin("report.task", "task")
        .leftJoin("task.isibo", "isibo")
        .where("isibo.id = :isiboId", { isiboId: isibo.id });

      if (dateRange.startDate && dateRange.endDate) {
        reportQuery = reportQuery.andWhere(
          "report.createdAt BETWEEN :startDate AND :endDate",
          dateRange,
        );
      }

      const reports = await reportQuery.getMany();

      locationPerformance.push({
        locationId: isibo.id,
        locationName: isibo.name,
        locationType: "isibo",
        totalActivities: 0,
        completedTasks,
        totalTasks: tasks.length,
        completionRate:
          tasks.length > 0
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0,
        totalReports: reports.length,
      });
    }

    return locationPerformance;
  }

  async getEngagementMetrics(
    query: AnalyticsQueryDto,
    user?: User,
  ): Promise<EngagementMetricsDto> {
    let isiboQuery = this.isiboRepository.createQueryBuilder("isibo");

    if (user) {
      isiboQuery = this.applyLocationFilter(isiboQuery, user, "isibo");
    }

    const totalIsibos = await isiboQuery.getCount();

    // Count active isibos by checking if they have any tasks
    const activeIsibosQuery = this.taskRepository
      .createQueryBuilder("task")
      .select("COUNT(DISTINCT task.isibo_id)", "count")
      .where("task.isibo_id IS NOT NULL");

    if (user) {
      // Apply location filter to tasks based on user's location
      activeIsibosQuery.leftJoin("task.isibo", "isibo");
      this.applyLocationFilter(activeIsibosQuery, user, "isibo");
    }

    const activeIsibosResult = await activeIsibosQuery.getRawOne();
    const activeIsibos = parseInt(activeIsibosResult?.count || "0");

    const totalUsers = await this.userRepository.count();

    // Count unique users who have attended any report (active users)
    const activeUsers = await this.reportRepository
      .createQueryBuilder("report")
      .leftJoin("report.attendance", "user")
      .select("COUNT(DISTINCT user.id)", "count")
      .where("user.id IS NOT NULL")
      .getRawOne();

    const locationPerformance = await this.getLocationPerformance(query, user);

    return {
      averageCitizensPerIsibo: 0,
      mostActiveVillages: locationPerformance.slice(0, 5),
      reportSubmissionFrequency: 0,
      totalCitizens: parseInt(activeUsers?.count || "0"),
    };
  }

  // Helper methods
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
    user: User | undefined,
    alias: string,
  ): any {
    if (!user) {
      return query;
    }

    if (user.role === UserRole.ADMIN) {
      return query;
    }

    if (user.role === UserRole.CELL_LEADER && user.cell?.id) {
      return query
        .leftJoin(`${alias}.cell`, "cell")
        .where("cell.id = :cellId", { cellId: user.cell.id });
    }

    if (user.role === UserRole.VILLAGE_LEADER && user.village?.id) {
      return query
        .leftJoin(`${alias}.village`, "village")
        .where("village.id = :villageId", {
          villageId: user.village.id,
        });
    }

    if (user.role === UserRole.ISIBO_LEADER && user.isibo?.id) {
      return query
        .leftJoin(`${alias}.isibo`, "isibo")
        .where("isibo.id = :isiboId", { isiboId: user.isibo.id });
    }

    return query;
  }

  private applyLocationFilter(
    query: any,
    user: User | undefined,
    entityType: string,
  ): any {
    if (!user) {
      return query;
    }

    if (user.role === UserRole.ADMIN) {
      return query;
    }

    if (user.role === UserRole.CELL_LEADER && user.cell?.id) {
      if (entityType === "village") {
        return query
          .leftJoin("village.cell", "cell")
          .where("cell.id = :cellId", { cellId: user.cell.id });
      }
      if (entityType === "isibo") {
        return query
          .leftJoin("isibo.village", "village")
          .leftJoin("village.cell", "cell")
          .where("cell.id = :cellId", { cellId: user.cell.id });
      }
      if (entityType === "cell") {
        return query.where("cell.id = :cellId", {
          cellId: user.cell.id,
        });
      }
    }

    if (user.role === UserRole.VILLAGE_LEADER && user.village?.id) {
      if (entityType === "village") {
        return query.where("village.id = :villageId", {
          villageId: user.village.id,
        });
      }
      if (entityType === "isibo") {
        return query
          .leftJoin("isibo.village", "village")
          .where("village.id = :villageId", {
            villageId: user.village.id,
          });
      }
    }

    if (user.role === UserRole.ISIBO_LEADER && user.isibo?.id) {
      if (entityType === "isibo") {
        return query.where("isibo.id = :isiboId", {
          isiboId: user.isibo.id,
        });
      }
    }

    return query;
  }

  private applyActivityLocationFilter(query: any, user?: User): any {
    if (!user) {
      return query;
    }

    if (user.role === UserRole.ADMIN) {
      return query;
    }

    if (user.role === UserRole.CELL_LEADER && user.cell?.id) {
      return query
        .leftJoin("activity.village", "village")
        .leftJoin("village.cell", "cell")
        .where("cell.id = :cellId", { cellId: user.cell.id });
    }

    if (user.role === UserRole.VILLAGE_LEADER && user.village?.id) {
      return query
        .leftJoin("activity.village", "village")
        .where("village.id = :villageId", {
          villageId: user.village.id,
        });
    }

    if (user.role === UserRole.ISIBO_LEADER && user.isibo?.id) {
      return query
        .leftJoin("activity.tasks", "task")
        .leftJoin("task.isibo", "isibo")
        .where("isibo.id = :isiboId", { isiboId: user.isibo.id });
    }

    return query;
  }

  private applyTaskLocationFilter(query: any, user?: User): any {
    if (!user) {
      return query;
    }

    if (user.role === UserRole.ADMIN) {
      return query;
    }

    if (user.role === UserRole.CELL_LEADER && user.cell?.id) {
      return query
        .leftJoin("task.isibo", "isibo")
        .leftJoin("isibo.village", "village")
        .leftJoin("village.cell", "cell")
        .where("cell.id = :cellId", { cellId: user.cell.id });
    }

    if (user.role === UserRole.VILLAGE_LEADER && user.village?.id) {
      return query
        .leftJoin("task.isibo", "isibo")
        .leftJoin("isibo.village", "village")
        .where("village.id = :villageId", {
          villageId: user.village.id,
        });
    }

    if (user.role === UserRole.ISIBO_LEADER && user.isibo?.id) {
      return query
        .leftJoin("task.isibo", "isibo")
        .where("isibo.id = :isiboId", { isiboId: user.isibo.id });
    }

    return query;
  }

  private applyReportLocationFilter(query: any, user?: User): any {
    if (!user) {
      return query;
    }

    if (user.role === UserRole.ADMIN) {
      return query;
    }

    if (user.role === UserRole.CELL_LEADER && user.cell?.id) {
      return query
        .leftJoin("report.task", "task")
        .leftJoin("task.isibo", "isibo")
        .leftJoin("isibo.village", "village")
        .leftJoin("village.cell", "cell")
        .where("cell.id = :cellId", { cellId: user.cell.id });
    }

    if (user.role === UserRole.VILLAGE_LEADER && user.village?.id) {
      return query
        .leftJoin("report.task", "task")
        .leftJoin("task.isibo", "isibo")
        .leftJoin("isibo.village", "village")
        .where("village.id = :villageId", {
          villageId: user.village.id,
        });
    }

    if (user.role === UserRole.ISIBO_LEADER && user.isibo?.id) {
      return query
        .leftJoin("report.task", "task")
        .leftJoin("task.isibo", "isibo")
        .where("isibo.id = :isiboId", { isiboId: user.isibo.id });
    }

    return query;
  }

  private async getActivityCount(
    query: AnalyticsQueryDto,
    user?: User,
  ): Promise<number> {
    const dateRange = this.getDateRange(query);

    let activityQuery = this.activityRepository.createQueryBuilder("activity");

    if (dateRange.startDate && dateRange.endDate) {
      activityQuery = activityQuery.where(
        "activity.createdAt BETWEEN :startDate AND :endDate",
        dateRange,
      );
    }

    if (user) {
      activityQuery = this.applyActivityLocationFilter(activityQuery, user);
    }

    return activityQuery.getCount();
  }

  private async getCountForDate(
    entityType: "activity" | "task" | "report",
    startDate: Date,
    endDate: Date,
    user?: User,
  ): Promise<number> {
    let query: any;

    switch (entityType) {
      case "activity":
        query = this.activityRepository.createQueryBuilder("activity");
        if (user) {
          query = this.applyActivityLocationFilter(query, user);
        }
        break;
      case "task":
        query = this.taskRepository.createQueryBuilder("task");
        if (user) {
          query = this.applyTaskLocationFilter(query, user);
        }
        break;
      case "report":
        query = this.reportRepository.createQueryBuilder("report");
        if (user) {
          query = this.applyReportLocationFilter(query, user);
        }
        break;
    }

    return query
      .where(`${entityType}.createdAt >= :startDate`, { startDate })
      .andWhere(`${entityType}.createdAt < :endDate`, { endDate })
      .getCount();
  }

  private async getCompletedTasksForDate(
    startDate: Date,
    endDate: Date,
    user?: User,
  ): Promise<number> {
    let query = this.taskRepository.createQueryBuilder("task");

    if (user) {
      query = this.applyTaskLocationFilter(query, user);
    }

    return query
      .where("task.createdAt >= :startDate", { startDate })
      .andWhere("task.createdAt < :endDate", { endDate })
      .andWhere("task.status = :status", { status: ETaskStatus.COMPLETED })
      .getCount();
  }

  private getDaysBetweenDates(startDate: Date, endDate: Date): number {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
