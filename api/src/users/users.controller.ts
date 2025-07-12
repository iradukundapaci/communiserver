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
  OkResponse,
  PaginatedOkResponse,
  PatchOperation,
  PostOperation,
  UnauthorizedResponse,
} from "src/__shared__/decorators";
import { GenericResponse } from "src/__shared__/dto/generic-response.dto";
import {
  IsAdmin,
  IsAdminOrCellLeader,
  IsAdminOrVillageLeader,
  IsAdminOrVillageLeaderOrIsiboLeader,
  IsAuthorized,
} from "src/auth/decorators/authorize.decorator";
import { GetUser } from "src/auth/decorators/get-user.decorator";
import { CreateCellLeaderDTO } from "./dto/create-cell-leader.dto";
import { CreateCitizenDTO } from "./dto/create-citizen.dto";
import { CreateIsiboLeaderDTO } from "./dto/create-isibo-leader.dto";
import { CreateVillageLeaderDTO } from "./dto/create-village-leader.dto";
import { FetchUserDto } from "./dto/fetch-user.dto";
import { FetchUserListDto } from "./dto/fetch-user-list.dto";
import { PasswordDto } from "./dto/update-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @OkResponse(UpdateUserDto.Output)
  @ApiRequestBody(UpdateUserDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ForbiddenResponse,
    NotFoundResponse,
    ConflictResponse,
    BadRequestResponse,
  )
  @PatchOperation("", "Update my user")
  async updateUser(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto.Input,
  ): Promise<GenericResponse<UpdateUserDto.Output>> {
    const updatedUser = await this.usersService.updateUser(
      user.id,
      updateUserDto,
    );
    return new GenericResponse("User updated successfully", updatedUser);
  }

  @OkResponse()
  @ApiRequestBody(PasswordDto.Input)
  @IsAuthorized()
  @PatchOperation(":id/change-password", "Change password")
  @ErrorResponses(UnauthorizedResponse, BadRequestResponse)
  async updatePassword(
    @GetUser() user: User,
    @Body() updatePasswordDto: PasswordDto.Input,
  ): Promise<GenericResponse> {
    await this.usersService.updatePassword(
      user.id,
      updatePasswordDto.newPassword,
    );
    return new GenericResponse("Password updated successfully");
  }

  @PaginatedOkResponse(FetchUserListDto.Output)
  @IsAdminOrVillageLeaderOrIsiboLeader()
  @GetOperation("", "Get all users")
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse)
  async findAllUsers(
    @Query() fetchUserDto: FetchUserListDto.Input,
    @GetUser() currentUser: User,
  ): Promise<GenericResponse<FetchUserListDto.Output>> {
    const users = await this.usersService.findAllUsers(
      fetchUserDto,
      currentUser,
    );
    return new GenericResponse("Users retrieved successfully", users);
  }

  @OkResponse(FetchUserDto.Output)
  @IsAuthorized()
  @GetOperation("me", "Get my user")
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getUser(
    @GetUser() user: User,
  ): Promise<GenericResponse<FetchUserDto.Output>> {
    const loggedinUser = await this.usersService.getUser(user.id);
    return new GenericResponse("User retrieved successfully", loggedinUser);
  }

  @OkResponse(FetchUserDto.Output)
  @IsAuthorized()
  @GetOperation(":id", "Get a user by id")
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getUserById(
    @Param("id") id: string,
  ): Promise<GenericResponse<FetchUserDto.Output>> {
    const user = await this.usersService.getUser(id);
    return new GenericResponse("User retrieved successfully", user);
  }

  @DeleteOperation(":id", "Delete a user")
  @IsAdminOrVillageLeaderOrIsiboLeader()
  @OkResponse()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async deleteUser(@Param("id") id: string): Promise<GenericResponse> {
    await this.usersService.deleteUser(id);
    return new GenericResponse("User deleted successfully");
  }

  @PostOperation("cell-leaders", "Create a new cell leader")
  @IsAdmin()
  @ApiRequestBody(CreateCellLeaderDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async createCellLeader(
    @Body() createCellLeaderDto: CreateCellLeaderDTO.Input,
  ): Promise<GenericResponse> {
    await this.usersService.createCellLeader(createCellLeaderDto);
    return new GenericResponse("Cell leader created successfully");
  }

  @PostOperation("village-leaders", "Create a new village leader")
  @IsAdminOrCellLeader()
  @ApiRequestBody(CreateVillageLeaderDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async createVillageLeader(
    @Body() createVillageLeaderDto: CreateVillageLeaderDTO.Input,
  ): Promise<GenericResponse> {
    await this.usersService.createVillageLeader(createVillageLeaderDto);
    return new GenericResponse("Village leader created successfully");
  }

  @PostOperation("isibo-leaders", "Create a new isibo leader")
  @IsAdminOrVillageLeader()
  @ApiRequestBody(CreateIsiboLeaderDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async createIsiboLeader(
    @Body() createIsiboLeaderDto: CreateIsiboLeaderDTO.Input,
  ): Promise<GenericResponse> {
    await this.usersService.createIsiboLeader(createIsiboLeaderDto);
    return new GenericResponse("Isibo leader created successfully");
  }

  @PostOperation("citizens", "Create a new citizen")
  @IsAdminOrVillageLeaderOrIsiboLeader()
  @ApiRequestBody(CreateCitizenDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async createCitizen(
    @Body() createCitizenDto: CreateCitizenDTO.Input,
    @GetUser() user: User,
  ): Promise<GenericResponse> {
    await this.usersService.createCitizen(createCitizenDto, user);
    return new GenericResponse("Citizen created successfully");
  }
}
