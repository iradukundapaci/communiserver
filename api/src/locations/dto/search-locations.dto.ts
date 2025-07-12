import { IsOptional, IsString, IsArray, IsUUID, IsEnum, IsDateString, IsNumber } from "class-validator";
import { AdvancedSearchDto } from "src/__shared__/dto/pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";

export enum LocationType {
  PROVINCE = 'province',
  DISTRICT = 'district',
  SECTOR = 'sector',
  CELL = 'cell',
  VILLAGE = 'village',
  HOUSE = 'house',
  ISIBO = 'isibo'
}

export namespace SearchLocationsDto {
  export class Input extends AdvancedSearchDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Search in location names and descriptions", required: false })
    q?: string;

    @IsOptional()
    @IsEnum(LocationType)
    @ApiProperty({ description: "Filter by location type", enum: LocationType, required: false })
    type?: LocationType;

    @IsOptional()
    @IsArray()
    @IsEnum(LocationType, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple location types", enum: LocationType, isArray: true, required: false })
    types?: LocationType[];

    @IsOptional()
    @IsUUID()
    @ApiProperty({ description: "Filter by parent location ID", required: false })
    parentId?: string;

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by multiple parent location IDs", type: [String], required: false })
    parentIds?: string[];

    @IsOptional()
    @IsUUID()
    @ApiProperty({ description: "Filter by province ID", required: false })
    provinceId?: string;

    @IsOptional()
    @IsUUID()
    @ApiProperty({ description: "Filter by district ID", required: false })
    districtId?: string;

    @IsOptional()
    @IsUUID()
    @ApiProperty({ description: "Filter by sector ID", required: false })
    sectorId?: string;

    @IsOptional()
    @IsUUID()
    @ApiProperty({ description: "Filter by cell ID", required: false })
    cellId?: string;

    @IsOptional()
    @IsUUID()
    @ApiProperty({ description: "Filter by village ID", required: false })
    villageId?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by province name", required: false })
    provinceName?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by district name", required: false })
    districtName?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by sector name", required: false })
    sectorName?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by cell name", required: false })
    cellName?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "Filter by village name", required: false })
    villageName?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Minimum population", required: false })
    minPopulation?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ description: "Maximum population", required: false })
    maxPopulation?: number;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter locations created from this date", required: false })
    createdFrom?: string;

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: "Filter locations created until this date", required: false })
    createdTo?: string;

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @ApiProperty({ description: "Filter by leader IDs", type: [String], required: false })
    leaderIds?: string[];
  }

  export interface LocationSearchResult {
    id: string;
    name: string;
    type: LocationType;
    description?: string;
    population?: number;
    parentLocation?: {
      id: string;
      name: string;
      type: LocationType;
    };
    leader?: {
      id: string;
      names: string;
      role: string;
    };
    childrenCount: number;
    createdAt: Date;
    updatedAt?: Date;
  }

  export class Output {
    @ApiProperty({ type: [Object] })
    items: LocationSearchResult[];

    @ApiProperty()
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
}
