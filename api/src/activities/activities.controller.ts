import { Body, Controller, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ApiRequestBody,
  BadRequestResponse,
  ConflictResponse,
  DeleteOperation,
  ErrorResponses,
  ForbiddenResponse,
  GetOperation,
  NotFoundResponse,
  PatchOperation,
  PostOperation,
  UnauthorizedResponse,
} from "src/__shared__/decorators";
import {
  IsAuthorized,
  IsCellLeaderOrVillageLeader,
} from "src/auth/decorators/authorize.decorator";
import { GenericResponse } from "../__shared__/dto/generic-response.dto";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ActivitiesService } from "./activities.service";
import { CreateActivityDTO } from "./dto/create-activity.dto";
import { FetchActivityDTO } from "./dto/fetch-activity.dto";
import { UpdateActivityDTO } from "./dto/update-activity.dto";
import { Activity } from "./entities/activity.entity";

@ApiTags("Activities")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("activities")
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @PostOperation("", "Create a new activity")
  @IsCellLeaderOrVillageLeader()
  @ApiRequestBody(CreateActivityDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async create(
    @Body() createActivityDTO: CreateActivityDTO.Input,
  ): Promise<GenericResponse<CreateActivityDTO.Output>> {
    const activity = await this.activitiesService.create(createActivityDTO);
    return new GenericResponse("Activity created successfully", activity);
  }

  @GetOperation("", "Get all activities")
  async findAll(
    @Query() DTO: FetchActivityDTO.Input,
  ): Promise<GenericResponse<{ items: FetchActivityDTO.Output[]; meta: any }>> {
    const activities = await this.activitiesService.findAll(DTO);
    return new GenericResponse("Activities retrieved successfully", activities);
  }

  @GetOperation(":id", "Get an activity by id")
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async findOne(@Param("id") id: string): Promise<GenericResponse<Activity>> {
    const activity = await this.activitiesService.findOne(id);
    return new GenericResponse("Activity retrieved successfully", activity);
  }

  @PatchOperation(":id", "Update an activity")
  @IsCellLeaderOrVillageLeader()
  @ApiRequestBody(UpdateActivityDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async update(
    @Param("id") id: string,
    @Body() updateActivityDTO: UpdateActivityDTO.Input,
  ): Promise<GenericResponse<UpdateActivityDTO.Output>> {
    const activity = await this.activitiesService.update(id, updateActivityDTO);
    return new GenericResponse("Activity updated successfully", activity);
  }

  @DeleteOperation(":id", "Delete an activity")
  @IsCellLeaderOrVillageLeader()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async remove(@Param("id") id: string): Promise<GenericResponse> {
    await this.activitiesService.delete(id);
    return new GenericResponse("Activity deleted successfully");
  }
}
