import { IsOptional, IsUUID, IsEnum, IsArray, IsString, IsDateString } from "class-validator";
import { AdvancedSearchDto } from "src/__shared__/dto/pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export enum ActivityStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export namespace FetchActivityDTO {
  export class Input extends AdvancedSearchDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Search in title and description", required: false })
    q?: string;

    @IsUUID()
    @IsOptional()
    @ApiProperty({ description: "Filter by cell ID", required: false })
    cellId?: string;

    @IsUUID()
    @IsOptional()
    @ApiProperty({ description: "Filter by village ID", required: false })
    villageId?: string;

    @IsUUID()
    @IsOptional()
    @ApiProperty({ description: "Filter by organizer ID", required: false })
    organizerId?: string;

    @IsOptional()
    @IsEnum(ActivityStatus)
    @ApiProperty({ description: "Filter by activity status", enum: ActivityStatus, required: false })
    status?: ActivityStatus;

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple village IDs", type: [String], required: false })
    villageIds?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple organizer IDs", type: [String], required: false })
    organizerIds?: string[];

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter activities from this date", required: false })
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter activities until this date", required: false })
    dateTo?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by activity type", required: false })
    activityType?: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    date: Date;
    village?: {
      id: string;
      name: string;
    };
    tasks?: {
      id: string;
      title: string;
      description: string;
      status: string;
      estimatedCost: number;
      actualCost: number;
      expectedParticipants: number;
      actualParticipants: number;
      expectedFinancialImpact: number;
      actualFinancialImpact: number;
      isibo?: {
        id: string;
        name: string;
      };
    }[];
  }
}
