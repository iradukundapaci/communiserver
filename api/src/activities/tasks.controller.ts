import { Body, Controller, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
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
import { GenericResponse } from "src/__shared__/dto/generic-response.dto";
import {
  IsAuthorized,
  IsCellLeaderOrVillageLeader,
} from "src/auth/decorators/authorize.decorator";
import { CreateTaskDTO } from "./dto/create-task.dto";
import { FetchTaskDTO } from "./dto/fetch-task.dto";
import { UpdateTaskDTO } from "./dto/update-task.dto";
import { TasksService } from "./tasks.service";

@ApiTags("Tasks")
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @PostOperation("", "Create a new task")
  @IsCellLeaderOrVillageLeader()
  @ApiRequestBody(CreateTaskDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async create(
    @Body() createTaskDTO: CreateTaskDTO.Input,
  ): Promise<GenericResponse<CreateTaskDTO.Output>> {
    const task = await this.tasksService.create(createTaskDTO);
    return new GenericResponse("Task created successfully", task);
  }

  @GetOperation("", "Get all tasks")
  @IsAuthorized()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse)
  async findAll(
    @Query() dto: FetchTaskDTO.Input,
  ): Promise<GenericResponse<{ items: FetchTaskDTO.Output[]; meta: any }>> {
    const tasks = await this.tasksService.findAll(dto);
    return new GenericResponse("Tasks retrieved successfully", tasks);
  }

  @GetOperation(":id", "Get a task by id")
  @IsAuthorized()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async findOne(
    @Param("id") id: string,
  ): Promise<GenericResponse<FetchTaskDTO.Output>> {
    const task = await this.tasksService.findOne(id);
    return new GenericResponse("Task retrieved successfully", task);
  }

  @PatchOperation(":id", "Update a task")
  @IsCellLeaderOrVillageLeader()
  @ApiRequestBody(UpdateTaskDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async update(
    @Param("id") id: string,
    @Body() updateTaskDTO: UpdateTaskDTO.Input,
  ): Promise<GenericResponse<UpdateTaskDTO.Output>> {
    const task = await this.tasksService.update(id, updateTaskDTO);
    return new GenericResponse("Task updated successfully", task);
  }

  @DeleteOperation(":id", "Delete a task")
  @IsCellLeaderOrVillageLeader()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async remove(@Param("id") id: string): Promise<GenericResponse> {
    await this.tasksService.remove(id);
    return new GenericResponse("Task deleted successfully");
  }
}
