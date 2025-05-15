import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { EActivityStatus } from "../enum/EActivityStatus";

export namespace FetchActivityDTO {
  export class Input extends PaginationDto {
    @IsOptional()
    q?: string;

    @IsEnum(EActivityStatus)
    @IsOptional()
    status?: EActivityStatus;

    @IsUUID()
    @IsOptional()
    cellId?: string;

    @IsUUID()
    @IsOptional()
    villageId?: string;

    @IsUUID()
    @IsOptional()
    organizerId?: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    date: Date;
    status: EActivityStatus;
    village?: {
      id: string;
      name: string;
    };
  }
}
