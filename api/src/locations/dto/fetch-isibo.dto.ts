import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { Isibo } from "../entities/isibo.entity";

export namespace FetchIsiboDto {
  export class Input extends PaginationDto {
    @IsUUID()
    @IsNotEmpty()
    villageId: string;

    @IsOptional()
    q?: string;
  }

  export class Output {
    items: Isibo[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
}
