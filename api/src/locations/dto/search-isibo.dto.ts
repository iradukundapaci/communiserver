import { IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { Isibo } from "../entities/isibo.entity";

export namespace SearchIsiboDto {
  export class Input extends PaginationDto {
    @IsOptional()
    q?: string;

    @IsUUID()
    @IsOptional()
    villageId?: string;
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
