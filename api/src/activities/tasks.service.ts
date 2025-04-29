import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets } from "typeorm";
import { Task } from "./entities/task.entity";
import { Activity } from "./entities/activity.entity";
import { UpdateTaskDTO } from "./dto/update-task.dto";
import { FetchTaskDTO } from "./dto/fetch-task.dto";
import { UsersService } from "../users/users.service";
import { plainToInstance } from "class-transformer";
import { paginate } from "nestjs-typeorm-paginate";
import { CreateTaskDTO } from "./dto/create-task.dto";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly usersService: UsersService,
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

    let assignedTo;
    if (createTaskDTO.assignedToId) {
      const user = await this.usersService.findUserById(
        createTaskDTO.assignedToId,
      );
      if (!user) {
        throw new NotFoundException("Assigned user not found");
      }
      assignedTo = user.profile;
    }

    const task = this.taskRepository.create({
      ...createTaskDTO,
      activity,
      assignedTo,
    });

    const savedTask = await this.taskRepository.save(task);
    return plainToInstance(CreateTaskDTO.Output, savedTask);
  }

  async findAll(dto: FetchTaskDTO.Input) {
    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.activity", "activity")
      .leftJoinAndSelect("task.assignedTo", "assignedTo")
      .orderBy("task.createdAt", "DESC");

    if (dto.activityId) {
      queryBuilder.andWhere("activity.id = :activityId", {
        activityId: dto.activityId,
      });
    }

    if (dto.completed !== undefined) {
      queryBuilder.andWhere("task.completed = :completed", {
        completed: dto.completed,
      });
    }

    if (dto.assignedToId) {
      queryBuilder.andWhere("assignedTo.id = :assignedToId", {
        assignedToId: dto.assignedToId,
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
      relations: ["activity", "assignedTo"],
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
      relations: ["activity", "assignedTo"],
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    let assignedTo = task.assignedTo;
    if (updateTaskDTO.assignedToId) {
      const user = await this.usersService.findUserById(
        updateTaskDTO.assignedToId,
      );
      if (!user) {
        throw new NotFoundException("Assigned user not found");
      }
      assignedTo = user.profile;
    }

    Object.assign(task, {
      ...updateTaskDTO,
      assignedTo,
    });

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
