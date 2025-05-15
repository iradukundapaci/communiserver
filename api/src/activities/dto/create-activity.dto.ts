import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { EActivityStatus } from "../enum/EActivityStatus";

export namespace CreateActivityDTO {
  export class Input {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    date: string;

    @IsUUID()
    @IsNotEmpty()
    villageId: string;

    @IsOptional()
    tasks?: Task[];
  }

  class Task {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    isiboId: string;
  }

  export class Output {
    id: string;
    title: string;
    description: string;
    status: EActivityStatus;
    date: Date;
    tasks: Task[];
  }
}
