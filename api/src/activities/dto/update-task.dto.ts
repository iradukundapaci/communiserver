import { IsString, IsOptional, IsUUID, IsBoolean } from "class-validator";

export namespace UpdateTaskDTO {
  export class Input {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

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
