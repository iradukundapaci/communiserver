import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';

export enum TimeRange {
  LAST_7_DAYS = '7d',
  LAST_30_DAYS = '30d',
  LAST_90_DAYS = '90d',
  LAST_YEAR = '1y',
}

export enum LocationLevel {
  CELL = 'cell',
  VILLAGE = 'village',
  ISIBO = 'isibo',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: TimeRange, default: TimeRange.LAST_30_DAYS })
  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange = TimeRange.LAST_30_DAYS;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: LocationLevel })
  @IsOptional()
  @IsEnum(LocationLevel)
  locationLevel?: LocationLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  locationId?: string;
}
