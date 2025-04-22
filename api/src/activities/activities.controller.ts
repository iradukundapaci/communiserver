import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ActivitiesService } from "./activities.service";
import { ActivityDto } from "./dto/activity.dto";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AllowRoles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../__shared__/enums/user-role.enum";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { Activity } from "./entities/activity.entity";
import { GenericResponse } from "../__shared__/dto/generic-response.dto";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../users/entities/user.entity";
import { CreateActivityDto } from "./dto/create-activity.dto";

@ApiTags("Activities")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("activities")
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @AllowRoles(UserRole.VILLAGE_LEADER, UserRole.CELL_LEADER)
  @ApiOperation({ summary: "Create a new activity" })
  @ApiResponse({
    status: 201,
    description: "Activity created successfully",
    type: Activity,
  })
  async create(
    @Body() createActivityDto: CreateActivityDto,
  ): Promise<GenericResponse<Activity>> {
    const activity = await this.activitiesService.create(createActivityDto);
    return new GenericResponse("Activity created successfully", activity);
  }

  @Get()
  @AllowRoles(
    UserRole.CITIZEN,
    UserRole.VILLAGE_LEADER,
    UserRole.CELL_LEADER,
    UserRole.ADMIN,
  )
  @ApiOperation({ summary: "Get all activities" })
  @ApiResponse({
    status: 200,
    description: "Returns all activities",
    type: [Activity],
  })
  async findAll(): Promise<GenericResponse<Activity[]>> {
    const activities = await this.activitiesService.findAll();
    return new GenericResponse("Activities retrieved successfully", activities);
  }

  @Get(":id")
  @AllowRoles(
    UserRole.CITIZEN,
    UserRole.VILLAGE_LEADER,
    UserRole.CELL_LEADER,
    UserRole.ADMIN,
  )
  @ApiOperation({ summary: "Get an activity by id" })
  @ApiResponse({
    status: 200,
    description: "Returns the activity",
    type: Activity,
  })
  async findOne(@Param("id") id: string): Promise<GenericResponse<Activity>> {
    const activity = await this.activitiesService.findOne(id);
    return new GenericResponse("Activity retrieved successfully", activity);
  }

  @Put(":id")
  @AllowRoles(UserRole.VILLAGE_LEADER, UserRole.CELL_LEADER)
  @ApiOperation({ summary: "Update an activity" })
  @ApiResponse({
    status: 200,
    description: "Activity updated successfully",
    type: Activity,
  })
  async update(
    @Param("id") id: string,
    @Body() updateActivityDto: ActivityDto.Update,
    @GetUser() user: User,
  ): Promise<GenericResponse<Activity>> {
    const activity = await this.activitiesService.update(
      id,
      updateActivityDto,
      user,
    );
    return new GenericResponse("Activity updated successfully", activity);
  }

  @Delete(":id")
  @AllowRoles(UserRole.VILLAGE_LEADER, UserRole.CELL_LEADER)
  @ApiOperation({ summary: "Delete an activity" })
  @ApiResponse({ status: 200, description: "Activity deleted successfully" })
  async delete(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GenericResponse> {
    await this.activitiesService.delete(id, user);
    return new GenericResponse("Activity deleted successfully");
  }
}
