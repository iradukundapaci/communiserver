import { IsOptional, IsUUID, IsEnum, IsArray, IsString, IsNumber, IsDateString } from "class-validator";
import { AdvancedSearchDto } from "src/__shared__/dto/pagination.dto";
import { ETaskStatus } from "../enum/ETaskStatus";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";

export namespace FetchTaskDTO {
  export class Input extends AdvancedSearchDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Search in title and description", required: false })
    q?: string;

    @IsUUID()
    @IsOptional()
    @ApiProperty({ description: "Filter by activity ID", required: false })
    activityId?: string;

    @IsOptional()
    @IsEnum(ETaskStatus)
    @ApiProperty({ description: "Filter by task status", enum: ETaskStatus, required: false })
    status?: ETaskStatus;

    @IsUUID()
    @IsOptional()
    @ApiProperty({ description: "Filter by isibo ID", required: false })
    isiboId?: string;

    @IsOptional()
    @IsArray()
    @IsEnum(ETaskStatus, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple task statuses", enum: ETaskStatus, isArray: true, required: false })
    statuses?: ETaskStatus[];

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple isibo IDs", type: [String], required: false })
    isiboIds?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple activity IDs", type: [String], required: false })
    activityIds?: string[];

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Minimum estimated cost", required: false })
    minEstimatedCost?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Maximum estimated cost", required: false })
    maxEstimatedCost?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Minimum expected participants", required: false })
    minExpectedParticipants?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Maximum expected participants", required: false })
    maxExpectedParticipants?: number;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter tasks created from this date", required: false })
    createdFrom?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter tasks created until this date", required: false })
    createdTo?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by village name (through activity)", required: false })
    villageName?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by cell name (through activity)", required: false })
    cellName?: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    status: ETaskStatus;
    estimatedCost: number;
    actualCost: number;
    expectedParticipants: number;
    actualParticipants: number;
    expectedFinancialImpact: number;
    actualFinancialImpact: number;
    isibo: {
      id: string;
      names: string;
    };
    activity: {
      id: string;
      title: string;
    };
  }
}
