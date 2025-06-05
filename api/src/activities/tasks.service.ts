import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { paginate } from "nestjs-typeorm-paginate";
import { Not, Repository } from "typeorm";
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

    const isibo = await this.isibosService.findIsiboById(createTaskDTO.isiboId);

    if (!isibo) {
      throw new NotFoundException("Isibo not found");
    }

    // Auto-calculate expected participants based on isibo member count
    const expectedParticipants = createTaskDTO.expectedParticipants || isibo.members?.length || 0;

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
      .leftJoinAndSelect("task.isibo", "isibo")
      .orderBy("task.createdAt", "DESC");

    if (dto.activityId) {
      queryBuilder.andWhere("activity.id = :activityId", {
        activityId: dto.activityId,
      });
    }

    if (dto.status) {
      queryBuilder.andWhere("task.status = :status", {
        status: dto.status,
      });
    }

    if (dto.isiboId) {
      queryBuilder.andWhere("isibo.id = :isiboId", {
        isiboId: dto.isiboId,
      });
    }

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

  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.taskRepository.remove(task);
  }
}
