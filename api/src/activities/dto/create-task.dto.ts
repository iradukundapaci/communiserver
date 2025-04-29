import { IsString, IsOptional, IsUUID } from "class-validator";

export namespace CreateTaskDTO {
  export class Input {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsUUID()
    activityId: string;

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
