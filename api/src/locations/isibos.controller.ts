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
  IsAdminOrVillageLeader,
  IsAuthorized,
  IsVillageLeader,
} from "src/auth/decorators/authorize.decorator";
import { GenericResponse } from "../__shared__/dto/generic-response.dto";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AssignIsiboLeaderDto } from "./dto/assign-isibo-leader.dto";
import { CreateIsiboDto } from "./dto/create-isibo.dto";
import { FetchIsiboDto } from "./dto/fetch-isibo.dto";
import { UpdateIsiboDto } from "./dto/update-isibo.dto";
import { Isibo } from "./entities/isibo.entity";
import { IsibosService } from "./isibos.service";

@ApiTags("Isibos")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("isibos")
export class IsibosController {
  constructor(private readonly isibosService: IsibosService) {}

  @PostOperation("", "Create a new isibo")
  @IsAdminOrVillageLeader()
  @OkResponse(Isibo)
  @ApiRequestBody(CreateIsiboDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async createIsibo(
    @Body() createIsiboDto: CreateIsiboDto.Input,
  ): Promise<GenericResponse<Isibo>> {
    const isibo = await this.isibosService.createIsibo(createIsiboDto);
    return new GenericResponse("Isibo created successfully", isibo);
  }

  @PatchOperation(":id", "Update an isibo")
  @IsAdminOrVillageLeader()
  @OkResponse(Isibo)
  @ApiRequestBody(UpdateIsiboDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async updateIsibo(
    @Param("id") id: string,
    @Body() updateIsiboDto: UpdateIsiboDto.Input,
  ): Promise<GenericResponse<Isibo>> {
    const isibo = await this.isibosService.updateIsibo(id, updateIsiboDto);
    return new GenericResponse("Isibo updated successfully", isibo);
  }

  @DeleteOperation(":id", "Delete an isibo")
  @IsAdminOrVillageLeader()
  @OkResponse()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async deleteIsibo(@Param("id") id: string): Promise<GenericResponse> {
    await this.isibosService.deleteIsibo(id);
    return new GenericResponse("Isibo deleted successfully");
  }

  @GetOperation("", "Get all isibos in a village")
  @IsAuthorized()
  @PaginatedOkResponse(FetchIsiboDto.Output)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getAllIsibos(@Query() fetchIsiboDto: FetchIsiboDto.Input) {
    const result = await this.isibosService.findAllIsibos(fetchIsiboDto);
    return new GenericResponse("Isibos retrieved successfully", result);
  }

  @GetOperation(":id", "Get an isibo by id")
  @IsAuthorized()
  @OkResponse(Isibo)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getIsiboById(@Param("id") id: string): Promise<GenericResponse<Isibo>> {
    const isibo = await this.isibosService.findIsiboById(id);
    return new GenericResponse("Isibo retrieved successfully", isibo);
  }

  @PatchOperation(":id/assign-leader", "Assign a leader to an isibo")
  @IsVillageLeader()
  @OkResponse(Isibo)
  @ApiRequestBody(AssignIsiboLeaderDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async assignIsiboLeader(
    @Param("id") id: string,
    @Body() assignIsiboLeaderDto: AssignIsiboLeaderDto.Input,
  ): Promise<GenericResponse<Isibo>> {
    const isibo = await this.isibosService.assignIsiboLeader(
      id,
      assignIsiboLeaderDto.userId,
    );
    return new GenericResponse("Isibo leader assigned successfully", isibo);
  }

  @PatchOperation(":id/remove-leader", "Remove the leader from an isibo")
  @IsVillageLeader()
  @OkResponse(Isibo)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async removeIsiboLeader(
    @Param("id") id: string,
  ): Promise<GenericResponse<Isibo>> {
    const isibo = await this.isibosService.removeIsiboLeader(id);
    return new GenericResponse("Isibo leader removed successfully", isibo);
  }
}
