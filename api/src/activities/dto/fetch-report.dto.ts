import { IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { Report } from "../entities/report.entity";

export namespace FetchReportDTO {
  export class Input extends PaginationDto {
    @IsUUID()
    @IsOptional()
    activityId?: string;

    @IsUUID()
    @IsOptional()
    taskId?: string;

    @IsUUID()
    @IsOptional()
    isiboId?: string;
  }

  export class Output {
    items: Report[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
}
