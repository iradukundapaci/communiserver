import { Body, Controller, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ApiRequestBody,
  BadRequestResponse,
  DeleteOperation,
  ErrorResponses,
  ForbiddenResponse,
  GetOperation,
  NotFoundResponse,
  OkResponse,
  PaginatedOkResponse,
  PatchOperation,
  PostOperation,
  UnauthorizedResponse,
} from "src/__shared__/decorators";
import {
  IsAdmin,
  IsAdminOrCellLeader,
  IsAuthorized,
  IsCellLeader,
} from "src/auth/decorators/authorize.decorator";
import { GenericResponse } from "../__shared__/dto/generic-response.dto";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { User } from "../users/entities/user.entity";
import { AssignVillageLeaderDto } from "./dto/assign-village-leader.dto";
import { CreateVillageDto } from "./dto/create-village.dto";
import { FetchVillageDto } from "./dto/fetch-village.dto";
import { UpdateVillageDto } from "./dto/update-village.dto";
import { Village } from "./entities/village.entity";
import { VillagesService } from "./villages.service";

@ApiTags("Villages")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("villages")
export class VillagesController {
  constructor(private readonly villagesService: VillagesService) {}

  @PostOperation("", "Create a new village")
  @IsAdmin()
  @OkResponse(Village)
  @ApiRequestBody(CreateVillageDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async createVillage(
    @Body() createVillageDto: CreateVillageDto.Input,
    @GetUser() user: User,
  ): Promise<GenericResponse<Village>> {
    const village = await this.villagesService.createVillage(
      createVillageDto,
      user,
    );
    return new GenericResponse("Village created successfully", village);
  }

  @PatchOperation(":id", "Update a village")
  @IsAdmin()
  @OkResponse(Village)
  @ApiRequestBody(UpdateVillageDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async updateVillage(
    @Param("id") id: string,
    @Body() updateVillageDto: UpdateVillageDto.Input,
    @GetUser() user: User,
  ): Promise<GenericResponse<Village>> {
    const village = await this.villagesService.updateVillage(
      id,
      updateVillageDto,
      user,
    );
    return new GenericResponse("Village updated successfully", village);
  }

  @DeleteOperation(":id", "Delete a village")
  @IsAdmin()
  @OkResponse()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async deleteVillage(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GenericResponse> {
    await this.villagesService.deleteVillage(id, user);
    return new GenericResponse("Village deleted successfully");
  }

  @GetOperation("", "Get all villages")
  @IsAdminOrCellLeader()
  @PaginatedOkResponse(FetchVillageDto.Output)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getAllVillages(@Query() fetchVillageDto: FetchVillageDto.Input) {
    const result = await this.villagesService.findAllVillages(fetchVillageDto);
    return new GenericResponse("Villages retrieved successfully", result);
  }

  @GetOperation(":id", "Get a village by id")
  @IsAuthorized()
  @OkResponse(Village)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getVillageById(
    @Param("id") id: string,
  ): Promise<GenericResponse<Village>> {
    const village = await this.villagesService.findVillageById(id);
    return new GenericResponse("Village retrieved successfully", village);
  }

  @PatchOperation(":id/assign-leader", "Assign a leader to a village")
  @IsCellLeader()
  @OkResponse(Village)
  @ApiRequestBody(AssignVillageLeaderDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async assignVillageLeader(
    @Param("id") id: string,
    @Body() assignVillageLeaderDto: AssignVillageLeaderDto.Input,
  ): Promise<GenericResponse<Village>> {
    const village = await this.villagesService.assignVillageLeader(
      id,
      assignVillageLeaderDto.userId,
    );
    return new GenericResponse("Village leader assigned successfully", village);
  }

  @PatchOperation(":id/remove-leader", "Remove the leader from a village")
  @IsCellLeader()
  @OkResponse(Village)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async removeVillageLeader(
    @Param("id") id: string,
  ): Promise<GenericResponse<Village>> {
    const villageId = id;

    const village = await this.villagesService.removeVillageLeader(villageId);
    return new GenericResponse("Village leader removed successfully", village);
  }
}
