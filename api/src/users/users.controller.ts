import {
  Controller,
  Get,
  Put,
  Delete,
  UseGuards,
  Req,
  Body,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Request } from "express";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { User } from "./entities/user.entity";
import { GenericResponse } from "../__shared__/dto/generic-response.dto";
import { AllowRoles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../__shared__/enums/user-role.enum";
import { GetUser } from "src/auth/decorators/get-user.decorator";

interface RequestWithUser extends Request {
  user: { sub: string; role: UserRole };
}

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @AllowRoles(
    UserRole.CITIZEN,
    UserRole.ADMIN,
    UserRole.CELL_LEADER,
    UserRole.VILLAGE_LEADER,
  )
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({
    status: 200,
    description: "Returns the current user's profile",
    type: User,
  })
  async getCurrentUser(@GetUser() user: User): Promise<GenericResponse<User>> {
    const payload = await this.usersService.findById(user.id);
    return new GenericResponse("User profile retrieved successfully", payload);
  }

  @Put("me")
  @AllowRoles(
    UserRole.CITIZEN,
    UserRole.ADMIN,
    UserRole.CELL_LEADER,
    UserRole.VILLAGE_LEADER,
  )
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({
    status: 200,
    description: "User profile updated successfully",
    type: User,
  })
  async updateCurrentUser(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto.Input,
  ): Promise<GenericResponse<User>> {
    const payload = await this.usersService.update(user.id, updateUserDto);
    return new GenericResponse("User profile updated successfully", payload);
  }

  @Delete("me")
  @AllowRoles(
    UserRole.CITIZEN,
    UserRole.ADMIN,
    UserRole.CELL_LEADER,
    UserRole.VILLAGE_LEADER,
  )
  @ApiOperation({ summary: "Delete current user account" })
  @ApiResponse({
    status: 200,
    description: "User account deleted successfully",
  })
  async deleteCurrentUser(@GetUser() user: User): Promise<GenericResponse> {
    await this.usersService.delete(user.id);
    return new GenericResponse("User account deleted successfully");
  }
}
