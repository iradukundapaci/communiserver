// import { GenericResponse } from "src/__shared__/dto/generic-response.dto";
// import { IsAdmin } from "src/auth/decorators/authorize.decorator";
// import { Body, Controller, Param, Query } from "@nestjs/common";
// import { UsersService } from "./users.service";
// import { ApiTags } from "@nestjs/swagger";
// import {
//   ApiRequestBody,
//   BadRequestResponse,
//   ConflictResponse,
//   CreatedResponse,
//   DeleteOperation,
//   ErrorResponses,
//   ForbiddenResponse,
//   GetOperation,
//   NotFoundResponse,
//   OkResponse,
//   PaginatedOkResponse,
//   PatchOperation,
//   PostOperation,
//   UnauthorizedResponse,
// } from "src/__shared__/decorators";
// import { UpdateProfileDto } from "./dto/update-profile.dto";
// import { CreateManagerDTO } from "./dto/create-cell-leader.dto";
// import { FetchManagerDto } from "./dto/fetch-manager.dto";

// @ApiTags("Managers")
// @Controller("managers")
// export class ManagersController {
//   constructor(private readonly usersService: UsersService) {}

//   @PostOperation("", "Create manager")
//   @CreatedResponse()
//   @ApiRequestBody(CreateManagerDTO.Input)
//   @IsAdmin()
//   @ErrorResponses(
//     UnauthorizedResponse,
//     ForbiddenResponse,
//     ConflictResponse,
//     BadRequestResponse,
//   )
//   async createManager(
//     @Body() createAdminDTO: CreateManagerDTO.Input,
//   ): Promise<GenericResponse> {
//     await this.usersService.createManager(createAdminDTO);
//     return new GenericResponse("Manager successfully created");
//   }

//   @PatchOperation("/:id", "update manager profile")
//   @OkResponse(UpdateProfileDto.Output)
//   @ApiRequestBody(UpdateProfileDto.Input)
//   @IsAdmin()
//   @ErrorResponses(
//     UnauthorizedResponse,
//     ForbiddenResponse,
//     NotFoundResponse,
//     ConflictResponse,
//     BadRequestResponse,
//   )
//   async updateManagerProfile(
//     @Param("id") managerId: number,
//     @Body() updateProfileDto: UpdateProfileDto.Input,
//   ): Promise<GenericResponse<UpdateProfileDto.Output>> {
//     const updatedUser = await this.usersService.updateProfile(
//       managerId,
//       updateProfileDto,
//     );
//     return new GenericResponse("Profile updated successfully", updatedUser);
//   }

//   @GetOperation("", "Retrieving all managers")
//   @IsAdmin()
//   @PaginatedOkResponse(FetchManagerDto.Output)
//   async getAllManager(
//     @Query() fetchUserDto: FetchManagerDto.Input,
//   ): Promise<GenericResponse<FetchManagerDto.Output>> {
//     const result = await this.usersService.findAllManagers(fetchUserDto);
//     return new GenericResponse("Managers retrieved successfully", result);
//   }

//   @OkResponse()
//   @IsAdmin()
//   @DeleteOperation(":id", "Delete a manager")
//   @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
//   async deleteManager(@Param("id") id: number): Promise<GenericResponse> {
//     await this.usersService.deleteManager(id);
//     return new GenericResponse("Manager deleted successfully");
//   }

//   @OkResponse()
//   @IsAdmin()
//   @PatchOperation(":id/toggle-active-status", "Toggle manager pause")
//   @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
//   async pauseManager(@Param("id") id: number): Promise<GenericResponse> {
//     const message = await this.usersService.toggleManagerPause(id);
//     return new GenericResponse(message);
//   }
// }
