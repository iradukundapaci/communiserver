import { IsOptional, IsString, IsArray, IsEnum, IsUUID, IsDateString } from "class-validator";
import { AdvancedSearchDto } from "./pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export enum GlobalSearchEntity {
  ACTIVITIES = 'activities',
  TASKS = 'tasks',
  REPORTS = 'reports',
  USERS = 'users',
  LOCATIONS = 'locations',
  ALL = 'all'
}

export class GlobalSearchDto extends AdvancedSearchDto {
  @IsString()
  @ApiProperty({ description: "Global search query", required: true })
  q: string;

  @IsOptional()
  @IsArray()
  @IsEnum(GlobalSearchEntity, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @ApiProperty({ 
    description: "Entities to search in", 
    enum: GlobalSearchEntity, 
    isArray: true, 
    required: false,
    default: [GlobalSearchEntity.ALL]
  })
  entities?: GlobalSearchEntity[] = [GlobalSearchEntity.ALL];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @ApiProperty({ description: "Filter by location IDs (villages/cells)", type: [String], required: false })
  locationIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @ApiProperty({ description: "Filter by user IDs", type: [String], required: false })
  userIds?: string[];

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: "Search from this date", required: false })
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: "Search until this date", required: false })
  dateTo?: string;
}

export interface GlobalSearchResult {
  entity: GlobalSearchEntity;
  id: string;
  title: string;
  description?: string;
  relevanceScore: number;
  metadata: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export class GlobalSearchResponseDto {
  @ApiProperty({ description: "Search results grouped by entity type" })
  results: {
    activities: GlobalSearchResult[];
    tasks: GlobalSearchResult[];
    reports: GlobalSearchResult[];
    users: GlobalSearchResult[];
    locations: GlobalSearchResult[];
  };

  @ApiProperty({ description: "Total number of results across all entities" })
  totalResults: number;

  @ApiProperty({ description: "Search metadata" })
  meta: {
    query: string;
    searchTime: number;
    entitiesSearched: GlobalSearchEntity[];
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
