import { IsOptional, IsUUID, IsArray, IsString, IsNumber, IsDateString, IsBoolean } from "class-validator";
import { AdvancedSearchDto } from "src/__shared__/dto/pagination.dto";
import { Report } from "../entities/report.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";

export namespace FetchReportDTO {
  export class Input extends AdvancedSearchDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Search in comment and suggestions", required: false })
    q?: string;

    @IsUUID()
    @IsOptional()
    @ApiProperty({ description: "Filter by activity ID", required: false })
    activityId?: string;

    @IsUUID()
    @IsOptional()
    @ApiProperty({ description: "Filter by task ID", required: false })
    taskId?: string;

    @IsUUID()
    @IsOptional()
    @ApiProperty({ description: "Filter by isibo ID", required: false })
    isiboId?: string;

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple activity IDs", type: [String], required: false })
    activityIds?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple task IDs", type: [String], required: false })
    taskIds?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple isibo IDs", type: [String], required: false })
    isiboIds?: string[];

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Minimum actual cost", required: false })
    minActualCost?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Maximum actual cost", required: false })
    maxActualCost?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Minimum actual participants", required: false })
    minActualParticipants?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Maximum actual participants", required: false })
    maxActualParticipants?: number;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter reports created from this date", required: false })
    createdFrom?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter reports created until this date", required: false })
    createdTo?: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    @ApiProperty({ description: "Filter reports with evidence", required: false })
    hasEvidence?: boolean;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by village name (through task)", required: false })
    villageName?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by cell name (through task)", required: false })
    cellName?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by materials used", type: [String], required: false })
    materialsUsed?: string[];
  }

  export class Output {
    items: Report[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
}
