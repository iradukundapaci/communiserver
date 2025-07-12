import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { paginate } from "nestjs-typeorm-paginate";
import { Not, Repository, Brackets } from "typeorm";
import { IsibosService } from "../locations/isibos.service";
import { CreateTaskDTO } from "./dto/create-task.dto";
import { FetchTaskDTO } from "./dto/fetch-task.dto";
import { UpdateTaskDTO } from "./dto/update-task.dto";
import { Activity } from "./entities/activity.entity";
import { Task } from "./entities/task.entity";
import { ETaskStatus } from "./enum/ETaskStatus";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly isibosService: IsibosService,
  ) {}

  async create(
    createTaskDTO: CreateTaskDTO.Input,
  ): Promise<CreateTaskDTO.Output> {
    const activity = await this.activityRepository.findOne({
      where: { id: createTaskDTO.activityId },
    });

    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    const isibo = await this.isibosService.findIsiboWithHouseMembers(createTaskDTO.isiboId);

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    // Get all house members in this isibo for expected participants calculation
    const isiboHouseMembers = await this.isibosService.getIsiboHouseMembers(createTaskDTO.isiboId);

    // Auto-calculate expected participants based on house members count in the isibo
    const expectedParticipants =
      createTaskDTO.expectedParticipants || isiboHouseMembers.length;

    const existingTask = await this.taskRepository.findOne({
      where: {
        activity: { id: createTaskDTO.activityId },
        isibo: { id: createTaskDTO.isiboId },
      },
    });

    if (existingTask) {
      throw new ConflictException(
        "A task for this activity is already assigned to this Isibo",
      );
    }

    const task = this.taskRepository.create({
      title: createTaskDTO.title,
      description: createTaskDTO.description,
      status: ETaskStatus.PENDING,
      estimatedCost: createTaskDTO.estimatedCost || 0,
      actualCost: 0, // Always 0 during creation
      expectedParticipants: expectedParticipants,
      actualParticipants: 0, // Always 0 during creation
      expectedFinancialImpact: createTaskDTO.expectedFinancialImpact || 0,
      actualFinancialImpact: 0, // Always 0 during creation
      activity,
      isibo,
    });

    const savedTask = await this.taskRepository.save(task);

    // Create a clean object without circular references
    const taskData = {
      id: savedTask.id,
      title: savedTask.title,
      description: savedTask.description,
      status: savedTask.status,
      estimatedCost: savedTask.estimatedCost,
      actualCost: savedTask.actualCost,
      expectedParticipants: savedTask.expectedParticipants,
      actualParticipants: savedTask.actualParticipants,
      expectedFinancialImpact: savedTask.expectedFinancialImpact,
      actualFinancialImpact: savedTask.actualFinancialImpact,
      isibo: savedTask.isibo
        ? {
            id: savedTask.isibo.id,
            name: savedTask.isibo.name,
          }
        : undefined,
      activity: savedTask.activity
        ? {
            id: savedTask.activity.id,
            title: savedTask.activity.title,
          }
        : undefined,
    };

    return plainToInstance(CreateTaskDTO.Output, taskData);
  }

  async findAll(dto: FetchTaskDTO.Input) {
    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.activity", "activity")
      .leftJoinAndSelect("activity.village", "village")
      .leftJoinAndSelect("village.cell", "cell")
      .leftJoinAndSelect("task.isibo", "isibo");

    // Apply search query
    if (dto.q) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("task.title ILIKE :searchKey", {
            searchKey: `%${dto.q}%`,
          }).orWhere("task.description ILIKE :searchKey", {
            searchKey: `%${dto.q}%`,
          });
        }),
      );
    }

    // Apply activity filters
    if (dto.activityId) {
      queryBuilder.andWhere("activity.id = :activityId", {
        activityId: dto.activityId,
      });
    }

    if (dto.activityIds && dto.activityIds.length > 0) {
      queryBuilder.andWhere("activity.id IN (:...activityIds)", {
        activityIds: dto.activityIds,
      });
    }

    // Apply status filters
    if (dto.status) {
      queryBuilder.andWhere("task.status = :status", {
        status: dto.status,
      });
    }

    if (dto.statuses && dto.statuses.length > 0) {
      queryBuilder.andWhere("task.status IN (:...statuses)", {
        statuses: dto.statuses,
      });
    }

    // Apply isibo filters
    if (dto.isiboId) {
      queryBuilder.andWhere("isibo.id = :isiboId", {
        isiboId: dto.isiboId,
      });
    }

    if (dto.isiboIds && dto.isiboIds.length > 0) {
      queryBuilder.andWhere("isibo.id IN (:...isiboIds)", {
        isiboIds: dto.isiboIds,
      });
    }

    // Apply cost filters
    if (dto.minEstimatedCost !== undefined) {
      queryBuilder.andWhere("task.estimatedCost >= :minEstimatedCost", {
        minEstimatedCost: dto.minEstimatedCost,
      });
    }

    if (dto.maxEstimatedCost !== undefined) {
      queryBuilder.andWhere("task.estimatedCost <= :maxEstimatedCost", {
        maxEstimatedCost: dto.maxEstimatedCost,
      });
    }

    // Apply participant filters
    if (dto.minExpectedParticipants !== undefined) {
      queryBuilder.andWhere("task.expectedParticipants >= :minExpectedParticipants", {
        minExpectedParticipants: dto.minExpectedParticipants,
      });
    }

    if (dto.maxExpectedParticipants !== undefined) {
      queryBuilder.andWhere("task.expectedParticipants <= :maxExpectedParticipants", {
        maxExpectedParticipants: dto.maxExpectedParticipants,
      });
    }

    // Apply date filters
    if (dto.createdFrom) {
      queryBuilder.andWhere("task.createdAt >= :createdFrom", {
        createdFrom: dto.createdFrom,
      });
    }

    if (dto.createdTo) {
      queryBuilder.andWhere("task.createdAt <= :createdTo", {
        createdTo: dto.createdTo,
      });
    }

    if (dto.startDate) {
      queryBuilder.andWhere("task.createdAt >= :startDate", {
        startDate: dto.startDate,
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere("task.createdAt <= :endDate", {
        endDate: dto.endDate,
      });
    }

    // Apply location name filters
    if (dto.villageName) {
      queryBuilder.andWhere("village.name ILIKE :villageName", {
        villageName: `%${dto.villageName}%`,
      });
    }

    if (dto.cellName) {
      queryBuilder.andWhere("cell.name ILIKE :cellName", {
        cellName: `%${dto.cellName}%`,
      });
    }

    // Apply sorting
    const sortBy = dto.sortBy || 'createdAt';
    const sortOrder = dto.sortOrder || 'DESC';
    queryBuilder.orderBy(`task.${sortBy}`, sortOrder);

    const paginatedResult = await paginate<Task>(queryBuilder, {
      page: dto.page,
      limit: dto.size,
    });

    return {
      ...paginatedResult,
      items: paginatedResult.items.map((task) => {
        // Create a clean object without circular references
        const taskData = {
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
          // Include only necessary isibo data
          isibo: task.isibo
            ? {
                id: task.isibo.id,
                names: task.isibo.name,
              }
            : undefined,
          // Include only necessary activity data
          activity: task.activity
            ? {
                id: task.activity.id,
                title: task.activity.title,
              }
            : undefined,
        };
        return plainToInstance(FetchTaskDTO.Output, taskData);
      }),
    };
  }

  async findOne(id: string): Promise<FetchTaskDTO.Output> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ["activity", "isibo"],
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Create a clean object without circular references
    const taskData = {
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
      activity: task.activity
        ? {
            id: task.activity.id,
            title: task.activity.title,
          }
        : undefined,
    };

    return plainToInstance(FetchTaskDTO.Output, taskData);
  }

  async update(
    id: string,
    updateTaskDTO: UpdateTaskDTO.Input,
  ): Promise<UpdateTaskDTO.Output> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ["activity", "isibo"],
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const originalActivityId = task.activity?.id;
    const originalIsiboId = task.isibo?.id;
    let activityChanged = false;
    let isiboChanged = false;

    if (
      updateTaskDTO.activityId &&
      updateTaskDTO.activityId !== originalActivityId
    ) {
      const activity = await this.activityRepository.findOne({
        where: { id: updateTaskDTO.activityId },
      });

      if (!activity) {
        throw new NotFoundException("Activity not found");
      }

      task.activity = activity;
      activityChanged = true;
    }

    if (updateTaskDTO.isiboId && updateTaskDTO.isiboId !== originalIsiboId) {
      const isibo = await this.isibosService.findIsiboById(
        updateTaskDTO.isiboId,
      );

      if (!isibo) {
        throw new NotFoundException("Isibo not found");
      }

      task.isibo = isibo;
      isiboChanged = true;
    }

    if ((activityChanged || isiboChanged) && task.activity && task.isibo) {
      const existingTask = await this.taskRepository.findOne({
        where: {
          id: Not(id),
          activity: { id: task.activity.id },
          isibo: { id: task.isibo.id },
        },
      });

      if (existingTask) {
        throw new ConflictException(
          "Another task for this activity is already assigned to this Isibo",
        );
      }
    }

    if (updateTaskDTO.title) {
      task.title = updateTaskDTO.title;
    }

    if (updateTaskDTO.description) {
      task.description = updateTaskDTO.description;
    }

    if (updateTaskDTO.status) {
      task.status = updateTaskDTO.status;
    }

    // Update financial fields
    if (updateTaskDTO.estimatedCost !== undefined) {
      task.estimatedCost = updateTaskDTO.estimatedCost;
    }
    if (updateTaskDTO.actualCost !== undefined) {
      task.actualCost = updateTaskDTO.actualCost;
    }
    if (updateTaskDTO.expectedParticipants !== undefined) {
      task.expectedParticipants = updateTaskDTO.expectedParticipants;
    }
    if (updateTaskDTO.actualParticipants !== undefined) {
      task.actualParticipants = updateTaskDTO.actualParticipants;
    }
    if (updateTaskDTO.expectedFinancialImpact !== undefined) {
      task.expectedFinancialImpact = updateTaskDTO.expectedFinancialImpact;
    }
    if (updateTaskDTO.actualFinancialImpact !== undefined) {
      task.actualFinancialImpact = updateTaskDTO.actualFinancialImpact;
    }

    const updatedTask = await this.taskRepository.save(task);

    // Create a clean object without circular references
    const taskData = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      estimatedCost: updatedTask.estimatedCost,
      actualCost: updatedTask.actualCost,
      expectedParticipants: updatedTask.expectedParticipants,
      actualParticipants: updatedTask.actualParticipants,
      expectedFinancialImpact: updatedTask.expectedFinancialImpact,
      actualFinancialImpact: updatedTask.actualFinancialImpact,
      isibo: updatedTask.isibo
        ? {
            id: updatedTask.isibo.id,
            name: updatedTask.isibo.name,
          }
        : undefined,
      activity: updatedTask.activity
        ? {
            id: updatedTask.activity.id,
            title: updatedTask.activity.title,
          }
        : undefined,
    };

    return plainToInstance(UpdateTaskDTO.Output, taskData);
  }

  async getTaskEligibleAttendees(taskId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["isibo"],
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Get all house members from the isibo assigned to this task
    const houseMembers = await this.isibosService.getIsiboHouseMembers(task.isibo.id);

    return houseMembers.map(member => ({
      id: member.id,
      names: member.names,
      email: member.email,
      phone: member.phone,
      house: member.house ? {
        id: member.house.id,
        code: member.house.code,
        address: member.house.address
      } : null
    }));
  }

  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.taskRepository.remove(task);
  }
}
