import { IPage } from "../interfaces/pagination.interface";
import { IsOptional } from "class-validator";
import { Pagination } from "nestjs-typeorm-paginate";
import { ApiProperty } from "@nestjs/swagger";

export class PaginationDto {
  @IsOptional()
  page: number = 1;
  @IsOptional()
  size: number = 10;
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
