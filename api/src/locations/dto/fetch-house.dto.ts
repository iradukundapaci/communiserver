import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { House } from "../entities/house.entity";

export namespace FetchHouseDto {
  export class Input extends PaginationDto {
    @IsUUID()
    @IsNotEmpty()
    isiboId: string;

    @IsOptional()
    q?: string;
  }

  export class Output {
    items: House[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
}
