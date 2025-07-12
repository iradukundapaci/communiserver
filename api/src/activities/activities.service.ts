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
              existingTask.expectedFinancialImpact =
                taskDto.expectedFinancialImpact;
            }
            if (taskDto.actualFinancialImpact !== undefined) {
              existingTask.actualFinancialImpact =
                taskDto.actualFinancialImpact;
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

  async generateActivityReport(
    activityId: string,
  ): Promise<ActivityReportDTO.Output> {
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

    // Simple summary metrics
    const summary = {
      totalTasks: activity.tasks.length,
      completedTasks: reports.length,
      completionRate:
        activity.tasks.length > 0
          ? Math.round((reports.length / activity.tasks.length) * 100)
          : 0,
      totalCost: reports.reduce(
        (sum, report) => sum + (Number(report.task.actualCost) || 0),
        0,
      ),
      totalParticipants: reports.reduce(
        (sum, report) => sum + (Number(report.task.actualParticipants) || 0),
        0,
      ),
    };

    // Simple financial analysis
    const totalEstimatedCost = reports.reduce(
      (sum, report) => sum + (Number(report.task.estimatedCost) || 0),
      0,
    );
    const totalActualCost = summary.totalCost;
    const costVariance = totalActualCost - totalEstimatedCost;

    const financialAnalysis = {
      totalEstimatedCost,
      totalActualCost,
      costVariance,
      costVariancePercentage:
        totalEstimatedCost > 0
          ? Math.round((costVariance / totalEstimatedCost) * 100)
          : 0,
      costPerParticipant:
        summary.totalParticipants > 0
          ? Math.round(totalActualCost / summary.totalParticipants)
          : 0,
      costBreakdown: reports.map((report) => ({
        taskId: report.task.id,
        taskTitle: report.task.title,
        estimatedCost: Number(report.task.estimatedCost) || 0,
        actualCost: Number(report.task.actualCost) || 0,
        variance:
          (Number(report.task.actualCost) || 0) -
          (Number(report.task.estimatedCost) || 0),
      })),
    };

    // Simple participant analysis
    const totalExpectedParticipants = reports.reduce(
      (sum, report) => sum + (Number(report.task.expectedParticipants) || 0),
      0,
    );
    const participantVariance =
      summary.totalParticipants - totalExpectedParticipants;

    const participantAnalysis = {
      totalExpectedParticipants,
      totalActualParticipants: summary.totalParticipants,
      participationRate:
        totalExpectedParticipants > 0
          ? Math.round(
              (summary.totalParticipants / totalExpectedParticipants) * 100,
            )
          : 0,
      participantVariance,
      averageParticipantsPerTask:
        summary.completedTasks > 0
          ? Math.round(summary.totalParticipants / summary.completedTasks)
          : 0,
      participantDistribution: reports.map((report) => ({
        taskId: report.task.id,
        taskTitle: report.task.title,
        expected: Number(report.task.expectedParticipants) || 0,
        actual: Number(report.task.actualParticipants) || 0,
        variance:
          (Number(report.task.actualParticipants) || 0) -
          (Number(report.task.expectedParticipants) || 0),
        participants:
          report.attendance?.map((user) => ({
            id: user.id,
            name: user.names,
          })) || [],
      })),
    };

    // Simple task overview
    const taskOverview = activity.tasks.map((task) => {
      const report = reports.find((r) => r.task.id === task.id);

      return {
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          isibo: {
            id: task.isibo.id,
            name: task.isibo.name,
          },
        },
        report: report
          ? {
              estimatedCost: Number(report.task.estimatedCost) || 0,
              actualCost: Number(report.task.actualCost) || 0,
              expectedParticipants:
                Number(report.task.expectedParticipants) || 0,
              actualParticipants: Number(report.task.actualParticipants) || 0,
              comment: report.comment,
              materialsUsed: report.materialsUsed || [],
              challengesFaced: report.challengesFaced,
              suggestions: report.suggestions,
              evidenceUrls: report.evidenceUrls || [],
              participants:
                report.attendance?.map((user) => ({
                  id: user.id,
                  name: user.names,
                })) || [],
            }
          : null,
      };
    });

    // Simple insights
    const insights = {
      overallStatus: (summary.completionRate >= 80
        ? "excellent"
        : summary.completionRate >= 60
          ? "good"
          : summary.completionRate >= 40
            ? "average"
            : "needs_improvement") as
        | "excellent"
        | "good"
        | "average"
        | "needs_improvement",
      keyPoints: [
        summary.completionRate >= 80 ? "High task completion rate" : "",
        financialAnalysis.costVariancePercentage <= 10
          ? "Good cost management"
          : "",
        participantAnalysis.participationRate >= 90
          ? "Excellent participation"
          : "",
      ].filter(Boolean),
      recommendations: [
        summary.completionRate < 80
          ? "Focus on completing remaining tasks"
          : "",
        financialAnalysis.costVariancePercentage > 10
          ? "Review cost management practices"
          : "",
        participantAnalysis.participationRate < 75
          ? "Improve participant engagement"
          : "",
      ].filter(Boolean),
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
      taskOverview,
      insights,
    };
  }
}
