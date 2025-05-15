import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { paginate } from "nestjs-typeorm-paginate";
import { Brackets, Repository } from "typeorm";
import { IsibosService } from "../locations/isibos.service";
import { VillagesService } from "../locations/villages.service";
import { CreateActivityDTO } from "./dto/create-activity.dto";
import { FetchActivityDTO } from "./dto/fetch-activity.dto";
import { UpdateActivityDTO } from "./dto/update-activity.dto";
import { Activity } from "./entities/activity.entity";
import { Task } from "./entities/task.entity";
import { EActivityStatus } from "./enum/EActivityStatus";
import { ETaskStatus } from "./enum/ETaskStatus";

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
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

    // Convert string date to Date object for database storage
    const activity = this.activityRepository.create({
      title: createActivityDTO.title,
      description: createActivityDTO.description,
      date: new Date(createActivityDTO.date),
      status: EActivityStatus.PENDING,
      village,
    });

    // Handle tasks if provided
    if (createActivityDTO.tasks && createActivityDTO.tasks.length > 0) {
      activity.tasks = [];

      for (const taskDto of createActivityDTO.tasks) {
        const task = new Task();
        task.title = taskDto.title;
        task.description = taskDto.description;
        task.status = ETaskStatus.PENDING;

        // Find isibo
        if (taskDto.isiboId) {
          const isibo = await this.isibosService.findIsiboById(taskDto.isiboId);
          task.isibo = isibo;
        }

        activity.tasks.push(task);
      }
    }

    const savedActivity = await this.activityRepository.save(activity);
    return plainToInstance(CreateActivityDTO.Output, savedActivity);
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

    if (DTO.status) {
      queryBuilder.andWhere("activity.status = :status", {
        status: DTO.status,
      });
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
      items: paginatedResult.items.map((activity) =>
        plainToInstance(FetchActivityDTO.Output, activity),
      ),
    };
  }

  async getActivityDetails(id: string) {
    const activity = await this.findOne(id);
    return plainToInstance(FetchActivityDTO.Output, {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      date: activity.date,
      status: activity.status,
      village: activity.village,
      tasks: activity.tasks,
    });
  }

  async update(
    id: string,
    updateActivityDTO: UpdateActivityDTO.Input,
  ): Promise<Activity> {
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

    if (updateActivityDTO.status) {
      activity.status = updateActivityDTO.status;
    }

    // Handle tasks if provided
    if (updateActivityDTO.tasks && updateActivityDTO.tasks.length > 0) {
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

            // Update isibo if provided
            if (taskDto.isiboId) {
              const isibo = await this.isibosService.findIsiboById(
                taskDto.isiboId,
              );
              existingTask.isibo = isibo;
            }
          }
        } else {
          // Create new task
          const newTask = new Task();
          newTask.title = taskDto.title;
          newTask.description = taskDto.description;
          newTask.status = ETaskStatus.PENDING;

          // Find isibo
          if (taskDto.isiboId) {
            const isibo = await this.isibosService.findIsiboById(
              taskDto.isiboId,
            );
            newTask.isibo = isibo;
          }

          // Add to activity tasks
          if (!activity.tasks) {
            activity.tasks = [];
          }

          activity.tasks.push(newTask);
        }
      }
    }

    return await this.activityRepository.save(activity);
  }
}
