import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets } from "typeorm";
import { User } from "../users/entities/user.entity";
import { UserRole } from "../__shared__/enums/user-role.enum";
import { plainToInstance } from "class-transformer";
import { UsersService } from "../users/users.service";
import { paginate } from "nestjs-typeorm-paginate";
import { Activity } from "./entities/activity.entity";
import { CreateActivityDTO } from "./dto/create-activity.dto";
import { UpdateActivityDTO } from "./dto/update-activity.dto";
import { FetchActivityDTO } from "./dto/fetch-activity.dto";
import { LocationsService } from "../locations/locations.service";

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly usersService: UsersService,
    private readonly locationsService: LocationsService,
  ) {}

  async create(
    createActivityDTO: CreateActivityDTO.Input,
  ): Promise<CreateActivityDTO.Output> {
    const organizer = await this.usersService.findUserById(
      createActivityDTO.organizerId,
    );
    if (!organizer) {
      throw new NotFoundException("Organizer not found");
    }

    let cell;
    let village;

    if (createActivityDTO.cellId) {
      cell = await this.locationsService.findCellById(createActivityDTO.cellId);
    }

    if (createActivityDTO.villageId) {
      village = await this.locationsService.findVillageById(
        createActivityDTO.villageId,
      );
    }

    const activity = this.activityRepository.create({
      ...createActivityDTO,
      organizer: organizer.profile,
      cell,
      village,
    });

    const savedActivity = await this.activityRepository.save(activity);
    return plainToInstance(CreateActivityDTO.Output, savedActivity);
  }

  async delete(id: string, user: User): Promise<void> {
    try {
      const activity = await this.activityRepository.findOne({
        where: { id },
        relations: ["organizer"],
      });

      if (!activity) {
        throw new NotFoundException("Activity not found");
      }

      if (
        user.role !== UserRole.VILLAGE_LEADER &&
        user.role !== UserRole.CELL_LEADER
      ) {
        throw new ForbiddenException(
          "Only village and cell leaders can delete activities",
        );
      }

      if (activity.organizer.id !== user.profile.id) {
        throw new ForbiddenException(
          "You can only delete activities you organize",
        );
      }

      await this.activityRepository.softDelete(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
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
      relations: ["organizer", "participants", "tasks"],
    });

    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    return activity;
  }

  async findAll(DTO: FetchActivityDTO.Input) {
    const queryBuilder = this.activityRepository
      .createQueryBuilder("activity")
      .leftJoinAndSelect("activity.organizer", "organizer")
      .leftJoinAndSelect("activity.cell", "cell")
      .leftJoinAndSelect("activity.village", "village")
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

    if (DTO.cellId) {
      queryBuilder.andWhere("cell.id = :cellId", { cellId: DTO.cellId });
    }

    if (DTO.villageId) {
      queryBuilder.andWhere("village.id = :villageId", {
        villageId: DTO.villageId,
      });
    }

    if (DTO.organizerId) {
      queryBuilder.andWhere("organizer.id = :organizerId", {
        organizerId: DTO.organizerId,
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
      startDate: activity.startDate,
      endDate: activity.endDate,
      location: activity.location,
      status: activity.status,
      organizer: activity.organizer,
      participants: activity.participants,
      tasks: activity.tasks,
    });
  }

  async update(
    id: string,
    updateActivityDTO: UpdateActivityDTO.Input,
  ): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ["organizer", "cell", "village"],
    });

    if (!activity) {
      throw new NotFoundException("Activity not found");
    }

    let cell;
    let village;

    if (updateActivityDTO.cellId) {
      cell = await this.locationsService.findCellById(updateActivityDTO.cellId);
    }

    if (updateActivityDTO.villageId) {
      village = await this.locationsService.findVillageById(
        updateActivityDTO.villageId,
      );
    }

    Object.assign(activity, {
      ...updateActivityDTO,
      cell,
      village,
    });

    return await this.activityRepository.save(activity);
  }
}
