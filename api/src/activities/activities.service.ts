import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { paginate } from "nestjs-typeorm-paginate";
import { Brackets, Repository } from "typeorm";
import { Isibo } from "../locations/entities/isibo.entity";
import { IsibosService } from "../locations/isibos.service";
import { VillagesService } from "../locations/villages.service";
import { CreateActivityDTO } from "./dto/create-activity.dto";
import { FetchActivityDTO } from "./dto/fetch-activity.dto";
import { UpdateActivityDTO } from "./dto/update-activity.dto";
import { Activity } from "./entities/activity.entity";
import { Task } from "./entities/task.entity";
import { Report } from "./entities/report.entity";

import { ETaskStatus } from "./enum/ETaskStatus";
import { ActivityReportDTO } from "./dto/activity-report.dto";

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly isibosService: IsibosService,
    private readonly villagesService: VillagesService,
  ) {}

  async create(
    createActivityDTO: CreateActivityDTO.Input,
  ): Promise<CreateActivityDTO.Output> {
    let village = null;

    if (createActivityDTO.villageId) {
      village = await this.villagesService.findVillageById(
        createActivityDTO.villageId,
      );

      if (!village) {
        throw new NotFoundException("Village not found");
      }
    }

    const activity = this.activityRepository.create({
      title: createActivityDTO.title,
      description: createActivityDTO.description,
      date: new Date(createActivityDTO.date),
      village,
    });

    if (createActivityDTO.tasks && createActivityDTO.tasks.length > 0) {
      activity.tasks = [];

      // Map to track isibo IDs already assigned to tasks for this activity
      const assignedIsibos = new Set<string>();

      for (const taskDto of createActivityDTO.tasks) {
        // Check if isibo is provided and required
        if (!taskDto.isiboId) {
          throw new BadRequestException("Isibo ID is required for each task");
        }

        // Check if isibo is already assigned to another task in this activity
        if (assignedIsibos.has(taskDto.isiboId)) {
          throw new ConflictException(
            `Isibo with ID ${taskDto.isiboId} is already assigned to another task in this activity`,
          );
        }

        const task = new Task();
        task.title = taskDto.title;
        task.description = taskDto.description;
        task.status = ETaskStatus.PENDING;
        task.estimatedCost = taskDto.estimatedCost || 0;
        task.actualCost = 0; // Always 0 during creation
        task.expectedParticipants = 0;
        task.actualParticipants = 0; // Always 0 during creation
        task.expectedFinancialImpact = taskDto.expectedFinancialImpact || 0;
        task.actualFinancialImpact = 0; // Always 0 during creation
        task.activity = activity; // Set the activity reference

        // Find isibo
        const isibo = await this.isibosService.findIsiboById(taskDto.isiboId);
        if (!isibo) {
          throw new NotFoundException(
            `Isibo with ID ${taskDto.isiboId} not found`,
          );
        }
        task.isibo = isibo;
        assignedIsibos.add(taskDto.isiboId);

        activity.tasks.push(task);
      }
    }

    const savedActivity = await this.activityRepository.save(activity);

    // Create a clean object without circular references
    const activityData = {
      id: savedActivity.id,
      title: savedActivity.title,
      description: savedActivity.description,
      date: savedActivity.date,
      tasks: savedActivity.tasks
        ? savedActivity.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            estimatedCost: task.estimatedCost,
            actualCost: task.actualCost,
            expectedParticipants: task.expectedParticipants,
            actualParticipants: task.actualParticipants,
            expectedFinancialImpact: task.expectedFinancialImpact,
            actualFinancialImpact: task.actualFinancialImpact,
          }))
        : [],
    };

    return plainToInstance(CreateActivityDTO.Output, activityData);
  }

  async delete(id: string): Promise<void> {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id },
      });

      if (!activity) {
        throw new NotFoundException("Activity not found");
      }

      await this.activityRepository.softDelete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Activity deletion failed: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ["village", "tasks", "tasks.isibo"],
    });

    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    return activity;
  }

  async findAll(DTO: FetchActivityDTO.Input) {
    const queryBuilder = this.activityRepository
      .createQueryBuilder("activity")
      .leftJoinAndSelect("activity.village", "village")
      .leftJoinAndSelect("activity.tasks", "tasks")
      .leftJoinAndSelect("tasks.isibo", "isibo")
      .orderBy("activity.createdAt", "DESC");

    if (DTO.q) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("activity.title ILIKE :searchKey", {
            searchKey: `%${DTO.q}%`,
          }).orWhere("activity.description ILIKE :searchKey", {
            searchKey: `%${DTO.q}%`,
          });
        }),
      );
    }

    if (DTO.villageId) {
      queryBuilder.andWhere("village.id = :villageId", {
        villageId: DTO.villageId,
      });
    }

    const paginatedResult = await paginate<Activity>(queryBuilder, {
      page: DTO.page,
      limit: DTO.size,
    });

    return {
      ...paginatedResult,
      items: paginatedResult.items.map((activity) => {
        // Create a clean object without circular references
        const activityData = {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          date: activity.date,
          village: activity.village
            ? {
                id: activity.village.id,
                name: activity.village.name,
              }
            : undefined,
          tasks: activity.tasks
            ? activity.tasks.map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                estimatedCost: task.estimatedCost,
                actualCost: task.actualCost,
                expectedParticipants: task.expectedParticipants,
                actualParticipants: task.actualParticipants,
                expectedFinancialImpact: task.expectedFinancialImpact,
                actualFinancialImpact: task.actualFinancialImpact,
                isibo: task.isibo
                  ? {
                      id: task.isibo.id,
                      name: task.isibo.name,
                    }
                  : undefined,
              }))
            : [],
        };

        return plainToInstance(FetchActivityDTO.Output, activityData);
      }),
    };
  }

  async getActivityDetails(id: string) {
    const activity = await this.findOne(id);

    // Create a clean object without circular references
    const activityData = {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      date: activity.date,
      village: activity.village
        ? {
            id: activity.village.id,
            name: activity.village.name,
          }
        : undefined,
      tasks: activity.tasks
        ? activity.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            estimatedCost: task.estimatedCost,
            actualCost: task.actualCost,
            expectedParticipants: task.expectedParticipants,
            actualParticipants: task.actualParticipants,
            expectedFinancialImpact: task.expectedFinancialImpact,
            actualFinancialImpact: task.actualFinancialImpact,
            isibo: task.isibo
              ? {
                  id: task.isibo.id,
                  name: task.isibo.name,
                }
              : undefined,
          }))
        : [],
    };

    return plainToInstance(FetchActivityDTO.Output, activityData);
  }

  async update(
    id: string,
    updateActivityDTO: UpdateActivityDTO.Input,
  ): Promise<UpdateActivityDTO.Output> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ["village", "tasks", "tasks.isibo"],
    });

    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    let village = null;

    if (updateActivityDTO.villageId) {
      village = await this.villagesService.findVillageById(
        updateActivityDTO.villageId,
      );

      if (!village) {
        throw new NotFoundException("Village not found");
      }

      activity.village = village;
    }

    // Update basic fields
    if (updateActivityDTO.title) {
      activity.title = updateActivityDTO.title;
    }

    if (updateActivityDTO.description) {
      activity.description = updateActivityDTO.description;
    }

    if (updateActivityDTO.date) {
      activity.date = new Date(updateActivityDTO.date);
    }

    // Handle tasks if provided
    if (updateActivityDTO.tasks) {
      if (!activity.tasks) {
        activity.tasks = [];
      }

      // Keep track of task IDs that should be kept
      const taskIdsToKeep = updateActivityDTO.tasks
        .filter((task) => task.id)
        .map((task) => task.id);

      // Remove tasks that are not in the update DTO
      activity.tasks = activity.tasks.filter((task) =>
        taskIdsToKeep.includes(task.id),
      );

      // Map to track isibo IDs already assigned to tasks for this activity
      const assignedIsibos = new Map<string, string>(); // Maps isiboId -> taskId

      // First, add all existing tasks to the tracking map
      for (const task of activity.tasks) {
        if (task.isibo) {
          assignedIsibos.set(task.isibo.id, task.id);
          console.log(
            `Pre-tracked existing task ${task.id} for isibo ${task.isibo.id}`,
          );
        }
      }

      // Process each task in the DTO
      for (const taskDto of updateActivityDTO.tasks) {
        if (taskDto.id) {
          // Update existing task
          const existingTask = activity.tasks.find(
            (task) => task.id === taskDto.id,
          );

          if (existingTask) {
            // Update task fields
            if (taskDto.title) {
              existingTask.title = taskDto.title;
            }

            if (taskDto.description) {
              existingTask.description = taskDto.description;
            }

            if (taskDto.status) {
              existingTask.status = taskDto.status;
            }

            // Update financial fields
            if (taskDto.estimatedCost !== undefined) {
              existingTask.estimatedCost = taskDto.estimatedCost;
            }
            if (taskDto.actualCost !== undefined) {
              existingTask.actualCost = taskDto.actualCost;
            }
            if (taskDto.expectedParticipants !== undefined) {
              existingTask.expectedParticipants = taskDto.expectedParticipants;
            }
            if (taskDto.actualParticipants !== undefined) {
              existingTask.actualParticipants = taskDto.actualParticipants;
            }
            if (taskDto.expectedFinancialImpact !== undefined) {
              existingTask.expectedFinancialImpact = taskDto.expectedFinancialImpact;
            }
            if (taskDto.actualFinancialImpact !== undefined) {
              existingTask.actualFinancialImpact = taskDto.actualFinancialImpact;
            }

            // Update isibo if provided
            if (taskDto.isiboId) {
              // If the isibo ID is different from the current one
              if (
                !existingTask.isibo ||
                taskDto.isiboId !== existingTask.isibo.id
              ) {
                // Check if this isibo is already assigned to another task
                const existingTaskId = assignedIsibos.get(taskDto.isiboId);
                if (existingTaskId && existingTaskId !== existingTask.id) {
                  throw new ConflictException(
                    `Isibo with ID ${taskDto.isiboId} is already assigned to another task in this activity`,
                  );
                }

                const isibo = await this.isibosService.findIsiboById(
                  taskDto.isiboId,
                );

                if (!isibo) {
                  throw new NotFoundException(
                    `Isibo with ID ${taskDto.isiboId} not found`,
                  );
                }

                // If this task had a previous isibo, remove it from the tracking map
                if (existingTask.isibo) {
                  assignedIsibos.delete(existingTask.isibo.id);
                }

                // Create a new isibo reference to avoid potential issues with entity references
                existingTask.isibo = { id: isibo.id } as Isibo;
                assignedIsibos.set(isibo.id, existingTask.id);
              }
            }
          }
        } else {
          // Check if a task already exists for this isibo in this activity
          if (!taskDto.isiboId) {
            throw new BadRequestException("Isibo ID is required for each task");
          }

          // Check if this isibo is already assigned to a task in this activity
          const existingTaskId = assignedIsibos.get(taskDto.isiboId);
          if (existingTaskId) {
            // If the task already exists, skip it
            console.log(
              `Task for isibo ${taskDto.isiboId} already exists, skipping`,
            );
            continue;
          }

          // Find the isibo
          const isibo = await this.isibosService.findIsiboById(taskDto.isiboId);

          if (!isibo) {
            throw new NotFoundException(
              `Isibo with ID ${taskDto.isiboId} not found`,
            );
          }

          // Create new task
          const newTask = new Task();
          newTask.title = taskDto.title;
          newTask.description = taskDto.description;
          newTask.status = ETaskStatus.PENDING;

          // Use a simple reference to avoid circular references
          newTask.activity = { id: activity.id } as Activity;

          // Use a simple reference to avoid circular references
          newTask.isibo = { id: isibo.id } as Isibo;
          assignedIsibos.set(taskDto.isiboId, "new-task"); // Mark as assigned

          // Add to activity tasks
          activity.tasks.push(newTask);
        }
      }
    }

    // Save the activity with its tasks
    const savedActivity = await this.activityRepository.save(activity);

    // Create a clean object without circular references
    const activityData = {
      id: savedActivity.id,
      title: savedActivity.title,
      description: savedActivity.description,
      date: savedActivity.date,
      village: savedActivity.village
        ? {
            id: savedActivity.village.id,
            name: savedActivity.village.name,
          }
        : undefined,
      tasks: savedActivity.tasks
        ? savedActivity.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            estimatedCost: task.estimatedCost,
            actualCost: task.actualCost,
            expectedParticipants: task.expectedParticipants,
            actualParticipants: task.actualParticipants,
            expectedFinancialImpact: task.expectedFinancialImpact,
            actualFinancialImpact: task.actualFinancialImpact,
            isibo: task.isibo
              ? {
                  id: task.isibo.id,
                  name: task.isibo.name,
                }
              : undefined,
          }))
        : [],
    };

    return plainToInstance(UpdateActivityDTO.Output, activityData);
  }

  async generateActivityReport(activityId: string): Promise<ActivityReportDTO.Output> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
      relations: ["tasks", "tasks.isibo", "village"],
    });

    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    // Get all reports for this activity
    const reports = await this.reportRepository.find({
      where: { activity: { id: activityId } },
      relations: ["task", "task.isibo", "attendance"],
    });

    // Calculate summary metrics with proper number conversion
    const summary = {
      totalTasks: activity.tasks.length,
      completedTasks: reports.length,
      completionRate: activity.tasks.length > 0 ? (reports.length / activity.tasks.length) * 100 : 0,
      totalCost: reports.reduce((sum, report) => sum + (Number(report.actualCost) || 0), 0),
      totalParticipants: reports.reduce((sum, report) => sum + (Number(report.actualParticipants) || 0), 0),
      totalImpact: reports.reduce((sum, report) => sum + (Number(report.actualFinancialImpact) || 0), 0),
    };

    // Financial Analysis with proper number conversion
    const totalEstimatedCost = activity.tasks.reduce((sum, task) => sum + (Number(task.estimatedCost) || 0), 0);
    const totalActualCost = summary.totalCost;
    const costVariance = totalActualCost - totalEstimatedCost;
    const costVariancePercentage = totalEstimatedCost > 0 ? (costVariance / totalEstimatedCost) * 100 : 0;

    const financialAnalysis: ActivityReportDTO.FinancialAnalysis = {
      totalEstimatedCost,
      totalActualCost,
      costVariance,
      costVariancePercentage,
      budgetUtilization: totalEstimatedCost > 0 ? (totalActualCost / totalEstimatedCost) * 100 : 0,
      costPerParticipant: summary.totalParticipants > 0 ? totalActualCost / summary.totalParticipants : 0,
      costPerTask: summary.completedTasks > 0 ? totalActualCost / summary.completedTasks : 0,
      roiScore: totalActualCost > 0 ? (summary.totalImpact / totalActualCost) * 100 : 0,
      costBreakdown: activity.tasks.map(task => {
        const report = reports.find(r => r.task.id === task.id);
        const actualCost = Number(report?.actualCost) || 0;
        const estimatedCost = Number(task.estimatedCost) || 0;
        return {
          taskId: task.id,
          taskTitle: task.title,
          estimatedCost,
          actualCost,
          variance: actualCost - estimatedCost,
          percentage: totalEstimatedCost > 0 ? (estimatedCost / totalEstimatedCost) * 100 : 0,
        };
      }),
    };

    // Participant Analysis with proper number conversion
    const totalExpectedParticipants = activity.tasks.reduce((sum, task) => sum + (Number(task.expectedParticipants) || 0), 0);
    const participantVariance = summary.totalParticipants - totalExpectedParticipants;

    const participantAnalysis: ActivityReportDTO.ParticipantAnalysis = {
      totalExpectedParticipants,
      totalActualParticipants: summary.totalParticipants,
      participationRate: totalExpectedParticipants > 0 ? (summary.totalParticipants / totalExpectedParticipants) * 100 : 0,
      participantVariance,
      averageParticipantsPerTask: summary.completedTasks > 0 ? summary.totalParticipants / summary.completedTasks : 0,
      participantDistribution: activity.tasks.map(task => {
        const report = reports.find(r => r.task.id === task.id);
        const expected = Number(task.expectedParticipants) || 0;
        const actual = Number(report?.actualParticipants) || 0;
        return {
          taskId: task.id,
          taskTitle: task.title,
          expected,
          actual,
          variance: actual - expected,
        };
      }),
    };

    // Evidence Summary
    const allEvidenceUrls = reports.flatMap(report => report.evidenceUrls || []);
    const evidenceSummary: ActivityReportDTO.EvidenceSummary = {
      totalFiles: allEvidenceUrls.length,
      filesByType: {
        images: allEvidenceUrls.filter(url => /\.(jpg|jpeg|png|gif|webp)$/i.test(url)).length,
        documents: allEvidenceUrls.filter(url => /\.(pdf|doc|docx|txt)$/i.test(url)).length,
        videos: allEvidenceUrls.filter(url => /\.(mp4|avi|mov|wmv)$/i.test(url)).length,
        other: allEvidenceUrls.filter(url => !/\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|txt|mp4|avi|mov|wmv)$/i.test(url)).length,
      },
      evidenceQuality: {
        high: Math.floor(allEvidenceUrls.length * 0.6), // 60% high quality
        medium: Math.floor(allEvidenceUrls.length * 0.3), // 30% medium quality
        low: Math.floor(allEvidenceUrls.length * 0.1), // 10% low quality
      },
      evidenceUrls: allEvidenceUrls,
    };

    // Task Performance Analysis
    const taskPerformance: ActivityReportDTO.TaskPerformance[] = activity.tasks.map(task => {
      const report = reports.find(r => r.task.id === task.id);
      
      // Calculate performance metrics with proper number conversion
      const estimatedCost = Number(task.estimatedCost) || 0;
      const actualCost = Number(report?.actualCost) || estimatedCost;
      const expectedParticipants = Number(task.expectedParticipants) || 0;
      const actualParticipants = Number(report?.actualParticipants) || 0;
      
      const costEfficiency = estimatedCost > 0 ? (estimatedCost / actualCost) * 100 : 100;
      const participantEngagement = expectedParticipants > 0 ? (actualParticipants / expectedParticipants) * 100 : 0;
      const completionQuality = report ? 100 : 0; // 100% if report exists, 0% if not
      
      const performanceScore = (costEfficiency + participantEngagement + completionQuality) / 3;
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (costEfficiency < 70 || participantEngagement < 50) riskLevel = 'high';
      else if (costEfficiency < 85 || participantEngagement < 75) riskLevel = 'medium';
      
      // Determine status
      let status: 'excellent' | 'good' | 'average' | 'needs_improvement' = 'needs_improvement';
      if (performanceScore >= 90) status = 'excellent';
      else if (performanceScore >= 75) status = 'good';
      else if (performanceScore >= 60) status = 'average';
      
      return {
        task,
        report,
        performanceScore,
        costEfficiency,
        participantEngagement,
        completionQuality,
        riskLevel,
        status,
      };
    });

    // Isibo Performance Analysis
    const isiboMap = new Map<string, ActivityReportDTO.IsiboPerformance>();
    
    activity.tasks.forEach(task => {
      const isiboId = task.isibo.id;
      const isiboName = task.isibo.name;
      
      if (!isiboMap.has(isiboId)) {
        isiboMap.set(isiboId, {
          isiboId,
          isiboName,
          tasksCount: 0,
          completedTasks: 0,
          totalCost: 0,
          totalParticipants: 0,
          averagePerformanceScore: 0,
          tasks: [],
        });
      }
      
      const isiboPerf = isiboMap.get(isiboId)!;
      isiboPerf.tasksCount++;
      
      const report = reports.find(r => r.task.id === task.id);
      if (report) {
        isiboPerf.completedTasks++;
        isiboPerf.totalCost += Number(report.actualCost) || 0;
        isiboPerf.totalParticipants += Number(report.actualParticipants) || 0;
      }
      
      const taskPerf = taskPerformance.find(tp => tp.task.id === task.id);
      if (taskPerf) {
        isiboPerf.tasks.push(taskPerf);
      }
    });
    
    // Calculate average performance scores
    isiboMap.forEach(isiboPerf => {
      if (isiboPerf.tasks.length > 0) {
        isiboPerf.averagePerformanceScore = isiboPerf.tasks.reduce((sum, task) => sum + task.performanceScore, 0) / isiboPerf.tasks.length;
      }
    });

    // Activity Insights
    const insights: ActivityReportDTO.ActivityInsights = {
      overallPerformanceScore: taskPerformance.reduce((sum, task) => sum + task.performanceScore, 0) / taskPerformance.length,
      keyStrengths: [
        summary.completionRate >= 80 ? "High task completion rate" : "",
        financialAnalysis.roiScore >= 150 ? "Strong return on investment" : "",
        participantAnalysis.participationRate >= 90 ? "Excellent participant engagement" : "",
      ].filter(Boolean),
      areasForImprovement: [
        summary.completionRate < 80 ? "Improve task completion rates" : "",
        financialAnalysis.costVariancePercentage > 10 ? "Better cost management needed" : "",
        participantAnalysis.participationRate < 75 ? "Increase participant engagement" : "",
      ].filter(Boolean),
      commonChallenges: reports.flatMap(report => report.challengesFaced ? [report.challengesFaced] : []).slice(0, 3),
      bestPractices: reports.flatMap(report => report.suggestions ? [report.suggestions] : []).slice(0, 3),
      recommendations: [
        "Implement regular progress tracking",
        "Enhance communication between isibos",
        "Provide additional training for task leaders",
      ],
      riskAssessment: {
        level: financialAnalysis.costVariancePercentage > 20 || participantAnalysis.participationRate < 60 ? 'high' : 
                financialAnalysis.costVariancePercentage > 10 || participantAnalysis.participationRate < 80 ? 'medium' : 'low',
        factors: [
          financialAnalysis.costVariancePercentage > 10 ? "Cost overruns" : "",
          participantAnalysis.participationRate < 80 ? "Low participation" : "",
          summary.completionRate < 80 ? "Incomplete tasks" : "",
        ].filter(Boolean),
      },
    };

    return {
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        date: activity.date,
        village: {
          id: activity.village?.id || "",
          name: activity.village?.name || "",
        },
      },
      summary,
      financialAnalysis,
      participantAnalysis,
      evidenceSummary,
      insights,
      isiboPerformance: Array.from(isiboMap.values()),
      taskPerformance,
      reports,
    };
  }
}
