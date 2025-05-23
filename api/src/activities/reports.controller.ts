import { Body, Controller, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  ApiRequestBody,
  BadRequestResponse,
  ConflictResponse,
  DeleteOperation,
  ErrorResponses,
  ForbiddenResponse,
  GetOperation,
  NotFoundResponse,
  PatchOperation,
  PostOperation,
  UnauthorizedResponse,
} from "src/__shared__/decorators";
import { GenericResponse } from "src/__shared__/dto/generic-response.dto";
import {
  IsAuthorized,
  IsCellLeaderOrVillageLeader,
  IsIsiboLeader,
} from "src/auth/decorators/authorize.decorator";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { CreateReportDTO } from "./dto/create-report.dto";
import { FetchReportDTO } from "./dto/fetch-report.dto";
import { UpdateReportDTO } from "./dto/update-report.dto";
import { Report } from "./entities/report.entity";
import { ReportsService } from "./reports.service";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @PostOperation("", "Submit a report for a task activity")
  @IsIsiboLeader()
  @ApiRequestBody(CreateReportDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async create(
    @Body() createReportDTO: CreateReportDTO.Input,
  ): Promise<GenericResponse<CreateReportDTO.Output>> {
    const report = await this.reportsService.create(createReportDTO);
    return new GenericResponse("Report submitted successfully", report);
  }

  @GetOperation("", "Get all reports")
  @IsAuthorized()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse)
  async findAll(
    @Query() DTO: FetchReportDTO.Input,
  ): Promise<GenericResponse<FetchReportDTO.Output>> {
    const reports = await this.reportsService.findAll(DTO);
    return new GenericResponse("Reports retrieved successfully", reports);
  }

  @GetOperation(":id", "Get a report by ID")
  @IsAuthorized()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async findOne(@Param("id") id: string): Promise<GenericResponse<Report>> {
    const report = await this.reportsService.findOne(id);
    return new GenericResponse("Report retrieved successfully", report);
  }

  @PatchOperation(":id", "Update a report")
  @IsIsiboLeader()
  @ApiRequestBody(UpdateReportDTO.Input)
  @ErrorResponses(
    UnauthorizedResponse,
    ConflictResponse,
    ForbiddenResponse,
    NotFoundResponse,
    BadRequestResponse,
  )
  async update(
    @Param("id") id: string,
    @Body() updateReportDTO: UpdateReportDTO.Input,
  ): Promise<GenericResponse<Report>> {
    const report = await this.reportsService.update(id, updateReportDTO);
    return new GenericResponse("Report updated successfully", report);
  }

  @DeleteOperation(":id", "Delete a report")
  @IsCellLeaderOrVillageLeader()
  @ErrorResponses(UnauthorizedResponse, ForbiddenResponse, NotFoundResponse)
  async remove(@Param("id") id: string): Promise<GenericResponse> {
    await this.reportsService.delete(id);
    return new GenericResponse("Report deleted successfully");
  }
}
