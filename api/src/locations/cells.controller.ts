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
import { IsAdmin, IsAuthorized } from "src/auth/decorators/authorize.decorator";
import { GenericResponse } from "../__shared__/dto/generic-response.dto";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CellsService } from "./cells.service";
import { AssignCellLeaderDto } from "./dto/assign-cell-leader.dto";
import { CreateCellDto } from "./dto/create-cell.dto";
import { FetchCellDto } from "./dto/fetch-cell.dto";
import { UpdateCellDto } from "./dto/update-cell.dto";
import { Cell } from "./entities/cell.entity";

@ApiTags("Cells")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("cells")
export class CellsController {
  constructor(private readonly cellsService: CellsService) {}

  @PostOperation("", "Create a new cell")
  @IsAdmin()
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
  ): Promise<GenericResponse<Cell>> {
    const cell = await this.cellsService.createCell(createCellDto);
    return new GenericResponse("Cell created successfully", cell);
  }

  @PatchOperation(":id", "Update a cell")
  @IsAdmin()
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
  ): Promise<GenericResponse<Cell>> {
    const cell = await this.cellsService.updateCell(id, updateCellDto);
    return new GenericResponse("Cell updated successfully", cell);
  }

  @DeleteOperation(":id", "Delete a cell")
  @IsAdmin()
  @OkResponse()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async deleteCell(@Param("id") id: string): Promise<GenericResponse> {
    await this.cellsService.deleteCell(id);
    return new GenericResponse("Cell deleted successfully");
  }

  @GetOperation("", "Get all cells")
  @IsAuthorized()
  @PaginatedOkResponse(FetchCellDto.Output)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse)
  async getAllCells(@Query() fetchCellDto: FetchCellDto.Input) {
    const result = await this.cellsService.findAllCells(fetchCellDto);
    return new GenericResponse("Cells retrieved successfully", result);
  }

  @GetOperation(":id", "Get a cell by id")
  @IsAuthorized()
  @OkResponse(Cell)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getCellById(@Param("id") id: string): Promise<GenericResponse<Cell>> {
    const cell = await this.cellsService.findCellById(id);
    return new GenericResponse("Cell retrieved successfully", cell);
  }

  @PatchOperation(":id/assign-leader", "Assign a leader to a cell")
  @IsAdmin()
  @OkResponse(Cell)
  @ApiRequestBody(AssignCellLeaderDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async assignCellLeader(
    @Param("id") id: string,
    @Body() assignCellLeaderDto: AssignCellLeaderDto.Input,
  ): Promise<GenericResponse<Cell>> {
    const cell = await this.cellsService.assignCellLeader(
      id,
      assignCellLeaderDto.userId,
    );
    return new GenericResponse("Cell leader assigned successfully", cell);
  }

  @PatchOperation(":id/remove-leader", "Remove the leader from a cell")
  @IsAdmin()
  @OkResponse(Cell)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async removeCellLeader(
    @Param("id") id: string,
  ): Promise<GenericResponse<Cell>> {
    const cell = await this.cellsService.removeCellLeader(id);
    return new GenericResponse("Cell leader removed successfully", cell);
  }
}
