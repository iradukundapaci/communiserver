import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Activity } from "./entities/activity.entity";
import { User } from "../users/entities/user.entity";
import { UserRole } from "../__shared__/enums/user-role.enum";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { CreateActivityDto } from "./dto/create-activity.dto";

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepository.create(createActivityDto);
    return await this.activityRepository.save(activity);
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    user: User,
  ): Promise<Activity> {
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
        "Only village and cell leaders can update activities",
      );
    }

    if (activity.organizer.id !== user.profile.id) {
      throw new ForbiddenException(
        "You can only update activities you organize",
      );
    }

    Object.assign(activity, {
      ...updateActivityDto,
      organizer: updateActivityDto.organizerId
        ? { id: updateActivityDto.organizerId }
        : undefined,
      participants: updateActivityDto.participantIds?.map((id) => ({ id })),
    });

    return this.activityRepository.save(activity);
  }

  async delete(id: string, user: User): Promise<void> {
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

  async findAll(): Promise<Activity[]> {
    return this.activityRepository.find({
      relations: ["organizer", "participants", "tasks"],
    });
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    await this.activityRepository.remove(activity);
  }

  async addParticipant(id: string): Promise<Activity> {
    const activity = await this.findOne(id);

    if (activity.currentParticipants >= activity.maxParticipants) {
      throw new Error("Activity is already full");
    }

    if (activity.status !== "active") {
      throw new Error("Cannot join an inactive activity");
    }

    activity.currentParticipants += 1;
    return await this.activityRepository.save(activity);
  }

  async removeParticipant(id: string): Promise<Activity> {
    const activity = await this.findOne(id);

    if (activity.currentParticipants <= 0) {
      throw new Error("No participants to remove");
    }

    activity.currentParticipants -= 1;
    return await this.activityRepository.save(activity);
  }

  async updateStatus(id: string, status: string): Promise<Activity> {
    const activity = await this.findOne(id);
    activity.status = status;
    return await this.activityRepository.save(activity);
  }
}
