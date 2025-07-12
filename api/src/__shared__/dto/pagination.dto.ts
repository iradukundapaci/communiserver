import { IPage } from "../interfaces/pagination.interface";
import { IsOptional, IsString, IsDateString, IsEnum, IsArray } from "class-validator";
import { Pagination } from "nestjs-typeorm-paginate";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class PaginationDto {
  @IsOptional()
  @ApiProperty({ description: "Page number", default: 1, required: false })
  page: number = 1;

  @IsOptional()
  @ApiProperty({ description: "Items per page", default: 10, required: false })
  size: number = 10;
}

export class AdvancedSearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Global search query", required: false })
  q?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "Field to sort by", required: false })
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiProperty({ description: "Sort order", enum: SortOrder, required: false })
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: "Start date for filtering", required: false })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: "End date for filtering", required: false })
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @ApiProperty({ description: "Tags to filter by", type: [String], required: false })
  tags?: string[];
}

export class PageResponseDto<T> implements IPage<T> {
  @ApiProperty({ type: [Object] })
  items: T[];
  totalItems?: number;
  itemCount?: number;
  itemsPerPage?: number;
  totalPages?: number;
  currentPage?: number;

  constructor(paginatedResult: Pagination<T>) {
    this.items = paginatedResult.items;
    this.totalItems = paginatedResult.meta.totalItems || 0;
    this.itemCount = paginatedResult.meta.itemCount || 0;
    this.itemsPerPage = paginatedResult.meta.itemsPerPage || 0;
    this.totalPages = paginatedResult.meta.totalPages || 0;
    this.currentPage = paginatedResult.meta.currentPage || 0;
  }
}
