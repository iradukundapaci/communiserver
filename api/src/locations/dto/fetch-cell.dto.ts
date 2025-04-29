import { IsOptional } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { Cell } from "../entities/cell.entity";

export namespace FetchCellDto {
  export class Input extends PaginationDto {
    @IsOptional()
    q?: string;
  }

  export class Output {
    items: Cell[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
}
