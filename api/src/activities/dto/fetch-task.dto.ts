import { IsBoolean, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";
import { ETaskStatus } from "../enum/ETaskStatus";

export namespace FetchTaskDTO {
  export class Input extends PaginationDto {
    @IsUUID()
    @IsOptional()
    activityId?: string;

    @IsBoolean()
    @IsOptional()
    status?: ETaskStatus;

    @IsUUID()
    @IsOptional()
    isiboId?: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    status: ETaskStatus;
    isibo: {
      id: string;
      names: string;
    };
    activity: {
      id: string;
      title: string;
    };
  }
}
