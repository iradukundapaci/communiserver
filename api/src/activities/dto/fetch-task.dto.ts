import { IsOptional, IsUUID, IsBoolean } from "class-validator";
import { PaginationDto } from "src/__shared__/dto/pagination.dto";

export namespace FetchTaskDTO {
  export class Input extends PaginationDto {
    @IsUUID()
    @IsOptional()
    activityId?: string;

    @IsBoolean()
    @IsOptional()
    completed?: boolean;

    @IsUUID()
    @IsOptional()
    assignedToId?: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    activity: {
      id: string;
      title: string;
    };
    assignedTo?: {
      id: string;
      names: string;
    };
  }
}
