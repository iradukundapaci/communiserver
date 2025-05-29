import { Body, Controller, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  ApiRequestBody,
  BadRequestResponse,
  ConflictResponse,
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
  IsAuthorized,
} from "src/auth/decorators/authorize.decorator";
import { GetUser } from "src/auth/decorators/get-user.decorator";
import { CreateCellLeaderDTO } from "./dto/create-cell-leader.dto";
import { CreateCitizenDTO } from "./dto/create-citizen.dto";
import { CreateIsiboLeaderDTO } from "./dto/create-isibo-leader.dto";
import { CreateVillageLeaderDTO } from "./dto/create-village-leader.dto";
import { FetchProfileDto } from "./dto/fetch-profile.dto";
import { FetchUserDto } from "./dto/fetch-user.dto";
import { PasswordDto } from "./dto/update-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @OkResponse(FetchProfileDto.Output)
  @IsAuthorized()
  @GetOperation("me", "Get my profile")
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getProfile(
    @GetUser() user: User,
  ): Promise<GenericResponse<FetchProfileDto.Output>> {
    const loggedinUser = await this.usersService.getProfile(user.id);

    return new GenericResponse("Profile retrieved successfully", loggedinUser);
  }

  @OkResponse(UpdateProfileDto.Output)
  @ApiRequestBody(UpdateProfileDto.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  @PatchOperation("", "Update my profile")
  @IsAuthorized()
  async updateProfile(
    @GetUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto.Input,
  ): Promise<GenericResponse<UpdateProfileDto.Output>> {
    const updatedUser = await this.usersService.updateProfile(
      user.id,
      updateProfileDto,
    );
    return new GenericResponse("Profile updated successfully", updatedUser);
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

  @GetOperation("", "Get all users")
  @IsAuthorized()
  @PaginatedOkResponse(FetchUserDto.Output)
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getAllUsers(@Query() fetchUserDto: FetchUserDto.Input) {
    const result = await this.usersService.findAllUsers(fetchUserDto);
    return new GenericResponse("Users retrieved successfully", result);
  }

  @OkResponse(FetchProfileDto.Output)
  @IsAuthorized()
  @GetOperation(":id", "Get a user by id")
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async getUser(
    @Param("id") id: string,
  ): Promise<GenericResponse<FetchProfileDto.Output>> {
    const user = await this.usersService.getProfile(id);
    return new GenericResponse("User retrieved successfully", user);
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
  @IsAdminOrVillageLeader()
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
  ): Promise<GenericResponse> {
    await this.usersService.createCitizen(createCitizenDto);
    return new GenericResponse("Citizen created successfully");
  }

}
