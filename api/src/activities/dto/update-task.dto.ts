import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { ETaskStatus } from "../enum/ETaskStatus";

export namespace UpdateTaskDTO {
  export class Input {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ETaskStatus)
    @IsOptional()
    status?: ETaskStatus;

    @IsUUID()
    @IsOptional()
    activityId?: string;

    @IsUUID()
    @IsOptional()
    isiboId?: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    status: ETaskStatus;
    activity: {
      id: string;
      title: string;
    };
    isibo: {
      id: string;
      name: string;
    };
  }
}
