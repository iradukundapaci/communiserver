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
  IsAdminOrIsiboLeader,
  IsAuthorized,
  IsIsiboLeader,
} from "src/auth/decorators/authorize.decorator";
import { GenericResponse } from "../__shared__/dto/generic-response.dto";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { User } from "../users/entities/user.entity";
import { AssignHouseRepresentativeDto } from "./dto/assign-house-representative.dto";
import { CreateHouseDto } from "./dto/create-house.dto";
import { FetchHouseDto } from "./dto/fetch-house.dto";
import { UpdateHouseDto } from "./dto/update-house.dto";
import { House } from "./entities/house.entity";
import { HousesService } from "./houses.service";

@ApiTags("Houses")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("houses")
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @PostOperation("", "Create a new house")
  @IsAdminOrIsiboLeader()
  @OkResponse(House)
  @ApiRequestBody(CreateHouseDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async createHouse(
    @Body() createHouseDto: CreateHouseDto.Input,
    @GetUser() user: User,
  ): Promise<GenericResponse<House>> {
    const house = await this.housesService.createHouse(createHouseDto, user);
    return new GenericResponse("House created successfully", house);
  }

  @PatchOperation(":id", "Update a house")
  @IsAdminOrIsiboLeader()
  @OkResponse(House)
  @ApiRequestBody(UpdateHouseDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async updateHouse(
    @Param("id") id: string,
    @Body() updateHouseDto: UpdateHouseDto.Input,
    @GetUser() user: User,
  ): Promise<GenericResponse<House>> {
    const house = await this.housesService.updateHouse(
      id,
      updateHouseDto,
      user,
    );
    return new GenericResponse("House updated successfully", house);
  }

  @DeleteOperation(":id", "Delete a house")
  @IsAdminOrIsiboLeader()
  @OkResponse()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async deleteHouse(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GenericResponse> {
    await this.housesService.deleteHouse(id, user);
    return new GenericResponse("House deleted successfully");
  }

  @GetOperation("", "Get all houses in an isibo")
  @IsAdminOrIsiboLeader()
  @PaginatedOkResponse(FetchHouseDto.Output)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getAllHouses(@Query() fetchHouseDto: FetchHouseDto.Input) {
    const result = await this.housesService.findAllHouses(fetchHouseDto);
    return new GenericResponse("Houses retrieved successfully", result);
  }

  @GetOperation(":id", "Get a house by id")
  @IsAuthorized()
  @OkResponse(House)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getHouseById(@Param("id") id: string): Promise<GenericResponse<House>> {
    const house = await this.housesService.findHouseById(id);
    return new GenericResponse("House retrieved successfully", house);
  }

  @PatchOperation(
    ":id/assign-representative",
    "Assign a representative to a house",
  )
  @IsAdminOrIsiboLeader()
  @OkResponse(House)
  @ApiRequestBody(AssignHouseRepresentativeDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async assignHouseRepresentative(
    @Param("id") id: string,
    @Body() assignHouseRepresentativeDto: AssignHouseRepresentativeDto.Input,
    @GetUser() user: User,
  ): Promise<GenericResponse<House>> {
    const house = await this.housesService.assignHouseRepresentative(
      id,
      assignHouseRepresentativeDto.userId,
      user,
    );
    return new GenericResponse(
      "House representative assigned successfully",
      house,
    );
  }

  @PatchOperation(
    ":id/remove-representative",
    "Remove the representative from a house",
  )
  @IsIsiboLeader()
  @OkResponse(House)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async removeHouseRepresentative(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GenericResponse<House>> {
    const house = await this.housesService.removeHouseRepresentative(id, user);
    return new GenericResponse(
      "House representative removed successfully",
      house,
    );
  }
}
