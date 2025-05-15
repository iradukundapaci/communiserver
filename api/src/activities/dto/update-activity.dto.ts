import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { EActivityStatus } from "../enum/EActivityStatus";
import { ETaskStatus } from "../enum/ETaskStatus";

export namespace UpdateActivityDTO {
  export class Input {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    date?: string;

    @IsEnum(EActivityStatus)
    @IsOptional()
    status?: EActivityStatus;

    @IsUUID()
    @IsOptional()
    villageId?: string;

    @IsOptional()
    tasks?: Task[];
  }

  class Task {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ETaskStatus)
    @IsOptional()
    status?: ETaskStatus;

    @IsString()
    @IsOptional()
    isiboId?: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    status: EActivityStatus;
    date: Date;
    tasks: Task[];
    village?: {
      id: string;
      name: string;
    };
  }
}
