import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { paginate } from "nestjs-typeorm-paginate";
import { Repository } from "typeorm";
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

    // Find the isibo
    const isibo = await this.isibosService.findIsiboById(createTaskDTO.isiboId);

    const task = this.taskRepository.create({
      title: createTaskDTO.title,
      description: createTaskDTO.description,
      status: ETaskStatus.PENDING,
      activity,
      isibo,
    });

    const savedTask = await this.taskRepository.save(task);
    return plainToInstance(CreateTaskDTO.Output, savedTask);
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
      items: paginatedResult.items.map((task) =>
        plainToInstance(FetchTaskDTO.Output, task),
      ),
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

    return plainToInstance(FetchTaskDTO.Output, task);
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

    // Update activity if provided
    if (updateTaskDTO.activityId) {
      const activity = await this.activityRepository.findOne({
        where: { id: updateTaskDTO.activityId },
      });

      if (!activity) {
        throw new NotFoundException("Activity not found");
      }

      task.activity = activity;
    }

    // Update isibo if provided
    if (updateTaskDTO.isiboId) {
      const isibo = await this.isibosService.findIsiboById(
        updateTaskDTO.isiboId,
      );
      task.isibo = isibo;
    }

    // Update other fields
    if (updateTaskDTO.title) {
      task.title = updateTaskDTO.title;
    }

    if (updateTaskDTO.description) {
      task.description = updateTaskDTO.description;
    }

    if (updateTaskDTO.status) {
      task.status = updateTaskDTO.status;
    }

    const updatedTask = await this.taskRepository.save(task);
    return plainToInstance(UpdateTaskDTO.Output, updatedTask);
  }

  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    await this.taskRepository.remove(task);
  }
}
