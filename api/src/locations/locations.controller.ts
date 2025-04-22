import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { LocationsService } from "./locations.service";
import { CellDto } from "./dto/cell.dto";
import { VillageDto } from "./dto/village.dto";
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
import { Cell } from "./entities/cell.entity";
import { Village } from "./entities/village.entity";
import { GenericResponse } from "../__shared__/dto/generic-response.dto";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Locations")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("locations")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // Cell endpoints
  @Post("cells")
  @AllowRoles(UserRole.CELL_LEADER)
  @ApiOperation({ summary: "Create a new cell" })
  @ApiResponse({
    status: 201,
    description: "Cell created successfully",
    type: Cell,
  })
  async createCell(
    @Body() createCellDto: CellDto.Create,
    @GetUser() user: User,
  ): Promise<GenericResponse<Cell>> {
    const cell = await this.locationsService.createCell(createCellDto, user);
    return new GenericResponse("Cell created successfully", cell);
  }

  @Put("cells/:id")
  @AllowRoles(UserRole.CELL_LEADER)
  @ApiOperation({ summary: "Update a cell" })
  @ApiResponse({
    status: 200,
    description: "Cell updated successfully",
    type: Cell,
  })
  async updateCell(
    @Param("id") id: string,
    @Body() updateCellDto: CellDto.Update,
    @GetUser() user: User,
  ): Promise<GenericResponse<Cell>> {
    const cell = await this.locationsService.updateCell(
      id,
      updateCellDto,
      user,
    );
    return new GenericResponse("Cell updated successfully", cell);
  }

  @Delete("cells/:id")
  @AllowRoles(UserRole.CELL_LEADER)
  @ApiOperation({ summary: "Delete a cell" })
  @ApiResponse({ status: 200, description: "Cell deleted successfully" })
  async deleteCell(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GenericResponse> {
    await this.locationsService.deleteCell(id, user);
    return new GenericResponse("Cell deleted successfully");
  }

  // Village endpoints
  @Post("villages")
  @AllowRoles(UserRole.VILLAGE_LEADER, UserRole.CELL_LEADER)
  @ApiOperation({ summary: "Create a new village" })
  @ApiResponse({
    status: 201,
    description: "Village created successfully",
    type: Village,
  })
  async createVillage(
    @Body() createVillageDto: VillageDto.Create,
    @GetUser() user: User,
  ): Promise<GenericResponse<Village>> {
    const village = await this.locationsService.createVillage(
      createVillageDto,
      user,
    );
    return new GenericResponse("Village created successfully", village);
  }

  @Put("villages/:id")
  @AllowRoles(UserRole.VILLAGE_LEADER, UserRole.CELL_LEADER)
  @ApiOperation({ summary: "Update a village" })
  @ApiResponse({
    status: 200,
    description: "Village updated successfully",
    type: Village,
  })
  async updateVillage(
    @Param("id") id: string,
    @Body() updateVillageDto: VillageDto.Update,
    @GetUser() user: User,
  ): Promise<GenericResponse<Village>> {
    const village = await this.locationsService.updateVillage(
      id,
      updateVillageDto,
      user,
    );
    return new GenericResponse("Village updated successfully", village);
  }

  @Delete("villages/:id")
  @AllowRoles(UserRole.VILLAGE_LEADER, UserRole.CELL_LEADER)
  @ApiOperation({ summary: "Delete a village" })
  @ApiResponse({ status: 200, description: "Village deleted successfully" })
  async deleteVillage(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GenericResponse> {
    await this.locationsService.deleteVillage(id, user);
    return new GenericResponse("Village deleted successfully");
  }
}
