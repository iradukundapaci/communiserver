import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { Village } from "../entities/village.entity";

export namespace FetchVillageDto {
  export class Input extends PaginationDto {
    @IsUUID()
    @IsNotEmpty()
    cellId: string;

    @IsOptional()
    q?: string;
  }

  export class Output {
    items: Village[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
}
