import { Controller, Body, Param, UseGuards, Query } from "@nestjs/common";
import { LocationsService } from "./locations.service";
import { CreateCellDto } from "./dto/create-cell.dto";
import { CreateVillageDto } from "./dto/create-village.dto";
import { UpdateCellDto } from "./dto/update-cell.dto";
import { UpdateVillageDto } from "./dto/update-village.dto";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AllowRoles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../__shared__/enums/user-role.enum";
import { ApiTags, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { Cell } from "./entities/cell.entity";
import { Village } from "./entities/village.entity";
import { GenericResponse } from "../__shared__/dto/generic-response.dto";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../users/entities/user.entity";
import {
  DeleteOperation,
  PatchOperation,
  PostOperation,
  OkResponse,
  ErrorResponses,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  BadRequestResponse,
  ApiRequestBody,
  GetOperation,
  PaginatedOkResponse,
} from "src/__shared__/decorators";
import { FetchCellDto } from "./dto/fetch-cell.dto";
import { FetchVillageDto } from "./dto/fetch-village.dto";

@ApiTags("Locations")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("locations")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @PostOperation("cells", "Create a new cell")
  @AllowRoles(UserRole.ADMIN)
  @OkResponse(Cell)
  @ApiRequestBody(CreateCellDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async createCell(
    @Body() createCellDto: CreateCellDto.Input,
    @GetUser() user: User,
  ): Promise<GenericResponse<Cell>> {
    const cell = await this.locationsService.createCell(createCellDto, user);
    return new GenericResponse("Cell created successfully", cell);
  }

  @PatchOperation("cells/:id", "Update a cell")
  @AllowRoles(UserRole.ADMIN, UserRole.CELL_LEADER)
  @OkResponse(Cell)
  @ApiRequestBody(UpdateCellDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async updateCell(
    @Param("id") id: string,
    @Body() updateCellDto: UpdateCellDto.Input,
    @GetUser() user: User,
  ): Promise<GenericResponse<Cell>> {
    const cell = await this.locationsService.updateCell(
      id,
      updateCellDto,
      user,
    );
    return new GenericResponse("Cell updated successfully", cell);
  }

  @DeleteOperation("cells/:id", "Delete a cell")
  @AllowRoles(UserRole.ADMIN, UserRole.CELL_LEADER)
  @OkResponse()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async deleteCell(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GenericResponse> {
    await this.locationsService.deleteCell(id, user);
    return new GenericResponse("Cell deleted successfully");
  }

  @GetOperation("cells", "Get all cells")
  @PaginatedOkResponse(FetchCellDto.Output)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse)
  async getAllCells(@Query() fetchCellDto: FetchCellDto.Input) {
    const result = await this.locationsService.findAllCells(fetchCellDto);
    return new GenericResponse("Cells retrieved successfully", result);
  }

  @GetOperation("cells/:id", "Get a cell by id")
  @OkResponse(Cell)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getCellById(@Param("id") id: string): Promise<GenericResponse<Cell>> {
    const cell = await this.locationsService.findCellById(id);
    return new GenericResponse("Cell retrieved successfully", cell);
  }

  // Village endpoints
  @PostOperation("villages", "Create a new village")
  @AllowRoles(UserRole.ADMIN, UserRole.VILLAGE_LEADER, UserRole.CELL_LEADER)
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
    const village = await this.locationsService.createVillage(
      createVillageDto,
      user,
    );
    return new GenericResponse("Village created successfully", village);
  }

  @PatchOperation("villages/:id", "Update a village")
  @AllowRoles(UserRole.ADMIN, UserRole.VILLAGE_LEADER, UserRole.CELL_LEADER)
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
    const village = await this.locationsService.updateVillage(
      id,
      updateVillageDto,
      user,
    );
    return new GenericResponse("Village updated successfully", village);
  }

  @DeleteOperation("villages/:id", "Delete a village")
  @AllowRoles(UserRole.ADMIN, UserRole.VILLAGE_LEADER, UserRole.CELL_LEADER)
  @OkResponse()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async deleteVillage(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GenericResponse> {
    await this.locationsService.deleteVillage(id, user);
    return new GenericResponse("Village deleted successfully");
  }

  @GetOperation("villages", "Get all villages in a cell")
  @PaginatedOkResponse(FetchVillageDto.Output)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getAllVillages(@Query() fetchVillageDto: FetchVillageDto.Input) {
    const result = await this.locationsService.findAllVillages(fetchVillageDto);
    return new GenericResponse("Villages retrieved successfully", result);
  }

  @GetOperation("villages/:id", "Get a village by id")
  @OkResponse(Village)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getVillageById(
    @Param("id") id: string,
  ): Promise<GenericResponse<Village>> {
    const village = await this.locationsService.findVillageById(id);
    return new GenericResponse("Village retrieved successfully", village);
  }
}
